package com.example.bookverse.configure;

import com.example.bookverse.component.CustomAccessDeniedHandler;
import com.example.bookverse.component.CustomAuthenticationEntryPoint;
import com.example.bookverse.jwt.JwtFilter;
import com.example.bookverse.jwt.JwtUtil;
import com.example.bookverse.jwt.LoginFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtUtil jwtUtil;
    private final AuthenticationConfiguration authenticationConfiguration;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public LogoutSuccessHandler logoutHandler() {
        return (request, response, authentication) -> {
            response.setStatus(HttpStatus.OK.value());
            response.getWriter().write("Logout success!!");

        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .formLogin(formLogin -> formLogin.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .authorizeHttpRequests(auth ->
                        auth.requestMatchers(
                                        "/api/", "/api/user/login", "/api/user/join", "/api/user/logout", // 로그아웃 엔드포인트 추가
                                        "/api/user/check/id", "/api/user/find/id", "/api/user/find/pw", "/api/review/book/{bookId}",
                                        "/api/book/search", "/api/book/bookdetail/{id}", "/api/book/category",
                                        "/api/purchase/top/all", "/api/purchase/top/category", "/api/book/booklist", "/api/book/all",
                                        "/api/reissue").permitAll()
                                .requestMatchers("/api/user/cancel", "/api/user/update/{id}", "/api/user/userinfo",
                                        "/api/review/add", "/api/review/book/{bookId}", "/api/review/user/{userId}",
                                        "/api/review/edit", "/api/review/delete",
                                        "/api/purchase/add/wish", "/api/purchase/delete/wish",
                                        "/api/purchase/add/cart", "/api/purchase/delete/cart", "/api/purchase/buy",
                                        "/api/purchase/membersPurchaseList").hasRole("USER")
                                .requestMatchers("/api/user/cancel", "/api/user/update/{id}", "/api/user/userinfo",
                                        "/api/review/add", "/api/review/book/{bookId}", "/api/review/user/{userId}",
                                        "/api/review/edit", "/api/review/delete",
                                        "/api/purchase/add/wish", "/api/purchase/delete/wish",
                                        "/api/purchase/add/cart", "/api/purchase/delete/cart", "/api/purchase/buy",
                                        "/api/purchase/membersPurchaseList",
                                        "/api/user/{userId}/setDormant", "/api/user/{userId}/setActive",
                                        "/api/user/filter", "/api/user/userlist",
                                        "/api/book/add", "/api/book/edit/{id}",
                                        "/api/purchase/purchaselist", "/api/purchase/members-purchaselist").hasRole("ADMIN")
                                .anyRequest().authenticated());

        http.cors(cors -> cors.configurationSource(request -> {
            CorsConfiguration config = new CorsConfiguration();
            config.setAllowedOrigins(List.of("http://localhost:3000", "http://13.124.100.87"));
            config.addAllowedMethod("*");
            config.addAllowedHeader("*");
            config.setAllowCredentials(true);
            config.addExposedHeader("Authorization");
            return config;
        }));

        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilterBefore(new JwtFilter(this.jwtUtil), LoginFilter.class);
        http.addFilterAt(new LoginFilter(authenticationManager(this.authenticationConfiguration), this.jwtUtil), UsernamePasswordAuthenticationFilter.class);

        http.exceptionHandling(exception -> {
            exception.authenticationEntryPoint(this.customAuthenticationEntryPoint);
            exception.accessDeniedHandler(this.customAccessDeniedHandler);
        });

        // 로그아웃 설정 추가
        http.logout(logout -> logout.logoutUrl("/api/user/logout")
                .logoutSuccessHandler(logoutHandler())
                .addLogoutHandler((request, response, authentication) -> {
                    if (request.getSession() != null) {
                        request.getSession().invalidate();
                    }
                }).deleteCookies("JSESSIONID", "refresh"));

        return http.build();
    }
}

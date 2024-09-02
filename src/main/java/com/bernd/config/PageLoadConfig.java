package com.bernd.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;
import org.springframework.web.servlet.resource.ResourceResolverChain;

import java.util.List;

/**
 * Serve index.html as 404 page.
 */
@Configuration
public class PageLoadConfig implements WebMvcConfigurer {

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/**")
        .addResourceLocations("classpath:/public/")
        .resourceChain(true)
        .addResolver(new IndexHtmlFallback());
  }

  private static class IndexHtmlFallback extends PathResourceResolver {
    @Override
    public Resource resolveResource(
        HttpServletRequest request,
        String requestPath,
        List<? extends Resource> locations,
        ResourceResolverChain chain) {
      Resource resource = super.resolveResource(request, requestPath, locations, chain);
      if (resource == null) {
        return super.resolveResource(request, "index.html", locations, chain);
      }
      return resource;
    }
  }
}
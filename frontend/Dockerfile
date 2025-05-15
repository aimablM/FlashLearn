# Use official NGINX base image
FROM nginx:alpine

# Clean default HTML content
RUN rm -rf /usr/share/nginx/html/*

# Copy all static files from the current directory to NGINX’s web root
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]

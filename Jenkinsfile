pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = "ap-south-1"
        DOCKER_REGISTRY = "123456789012.dkr.ecr.ap-south-1.amazonaws.com"
        IMAGE_BACKEND = "${DOCKER_REGISTRY}/rims-backend"
        IMAGE_FRONTEND = "${DOCKER_REGISTRY}/rims-frontend"
        TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Build & Test') {
            steps {
                dir('backend') {
                    sh 'mvn clean verify'
                }
            }
            post {
                always {
                    junit 'backend/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Frontend Build & Test') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run test:ci || npm test -- --watchAll=false'
                    sh 'npm run build'
                }
            }
        }

        stage('Container Image Build') {
            steps {
                sh "docker build -t ${IMAGE_BACKEND}:${TAG} -t ${IMAGE_BACKEND}:latest ./backend"
                sh "docker build -t ${IMAGE_FRONTEND}:${TAG} -t ${IMAGE_FRONTEND}:latest ./frontend"
            }
        }

        stage('Security Vulnerability Scan') {
            steps {
                sh "trivy image --severity HIGH,CRITICAL ${IMAGE_BACKEND}:${TAG} || true"
            }
        }

        stage('Deploy to Staging / AWS ECS') {
            when {
                branch 'main'
            }
            steps {
                sh "aws ecs update-service --cluster rims-cluster --service rims-backend-service --force-new-deployment"
                sh "aws s3 sync ./frontend/dist s3://xyz-retail-rims-frontend-static/ --delete"
                sh "aws cloudfront create-invalidation --distribution-id E12345EXAMPLE --paths '/*'"
            }
        }
    }
}

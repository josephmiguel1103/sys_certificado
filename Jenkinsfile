pipeline {
    agent any
    
    tools {
        nodejs "NODE_HOME"
    }
    
    environment {
        // ✅ Variables de entorno
        CHROME_BIN = '/usr/bin/google-chrome'
        SONAR_HOST = 'http://localhost:9000'
        PROJECT_KEY = 'frontend-angular'
    }
    
    stages {
        stage('Clone Repository') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    // ✅ Usar credencial almacenada en Jenkins (no el token directo)
                    git branch: 'main', 
                        credentialsId: 'github-credentials', // ← ID de credencial en Jenkins
                        url: 'https://github.com/josephmiguel1103/sys_certificado.git'
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    dir('certi-portal') {
                        sh 'npm ci' // ✅ Más rápido y seguro que npm install
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                timeout(time: 8, unit: 'MINUTES') {
                    dir('certi-portal') {
                        sh 'npm run build -- --configuration production'
                    }
                }
            }
        }
        
        stage('Test & Coverage') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    dir('certi-portal') {
                        // ✅ Ejecutar tests con opciones optimizadas
                        sh '''
                            ng test \
                                --watch=false \
                                --browsers=ChromeHeadless \
                                --code-coverage \
                                --source-map=false \
                                --progress=false
                        '''
                    }
                }
            }
            post {
                always {
                    // ✅ Publicar resultados de tests (opcional)
                    dir('certi-portal') {
                        junit allowEmptyResults: true, testResults: 'coverage/**/test-results.xml'
                    }
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    dir('certi-portal') {
                        script {
                            // ✅ Usar withSonarQubeEnv con token almacenado en Jenkins
                            withSonarQubeEnv('sonarqube') {
                                sh """
                                    sonar-scanner \
                                        -Dsonar.projectKey=${env.PROJECT_KEY} \
                                        -Dsonar.sources=src \
                                        -Dsonar.exclusions=**/*.spec.ts,**/node_modules/**,**/coverage/** \
                                        -Dsonar.tests=src \
                                        -Dsonar.test.inclusions=**/*.spec.ts \
                                        -Dsonar.javascript.lcov.reportPaths=coverage/certi-portal/lcov.info \
                                        -Dsonar.typescript.lcov.reportPaths=coverage/certi-portal/lcov.info \
                                        -Dsonar.host.url=${env.SONAR_HOST}
                                """
                            }
                        }
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    script {
                        // ✅ Esperar a que SonarQube procese el análisis
                        sleep(time: 10, unit: 'SECONDS')
                        
                        // ✅ Verificar Quality Gate
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "❌ Quality Gate falló: ${qg.status}"
                        }
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main' // ✅ Solo desplegar desde main
            }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    dir('certi-portal') {
                        echo '🚀 Preparando despliegue...'
                        
                        // ✅ Ejemplo: Copiar al servidor
                        // sh 'scp -r dist/certi-portal/* user@server:/var/www/html/'
                        
                        // ✅ O crear imagen Docker
                        // sh 'docker build -t certi-portal:latest .'
                        // sh 'docker push certi-portal:latest'
                        
                        echo '✅ Build listo en: certi-portal/dist/certi-portal'
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo '🏁 Pipeline finalizado.'
            // ✅ Limpiar workspace (opcional)
            // cleanWs()
        }
        success {
            echo '✅ Pipeline completado correctamente.'
            // ✅ Notificar éxito (Slack, email, etc.)
        }
        failure {
            echo '❌ El pipeline ha fallado.'
            // ✅ Notificar fallo
        }
        unstable {
            echo '⚠️ Pipeline inestable (tests o quality gate con warnings).'
        }
    }
}
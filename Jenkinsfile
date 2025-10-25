pipeline {
    agent any

    tools {
        nodejs "NODE_HOME" // asegúrate de tener configurado Node en Jenkins
    }

    stages {

        stage('Clone') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    git branch: 'main', credentialsId: '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', url: 'https://github.com/josephmiguel1103/sys_certificado.git'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    dir('certi-portal') {
                        sh 'npm install'
                    }
                }
            }
        }

        stage('Build') {
            steps {
                timeout(time: 8, unit: 'MINUTES') {
                    dir('certi-portal') {
                        sh 'npm run build --if-present'
                    }
                }
            }
        }

        stage('Test & Coverage') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    dir('certi-portal') {
                        // Ejecuta los tests y genera el archivo lcov.info
                        sh 'ng test --watch=false --browsers=ChromeHeadless --code-coverage'
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    dir('certi-portal') {
                        withSonarQubeEnv('sonarqube') {
                            // Ejecuta el análisis con sonar-scanner
                            sh 'sonar-scanner -Dsonar.projectKey=frontend-angular -Dsonar.sources=src -Dsonar.javascript.lcov.reportPaths=coverage/certi-portal/lcov.info -Dsonar.host.url=http://localhost:9000 -Dsonar.login=squ_68f3ffe60b0eb38f2d43ac9d12b1ceea4f022c0e'
                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                sleep(10)
                timeout(time: 4, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Deploy') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    dir('certi-portal') {
                        echo 'El build de Angular está listo para desplegar.'
                        // Aquí podrías agregar un paso de copia al servidor, docker build, etc.
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finalizado (éxito o fallo).'
        }
        success {
            echo '✅ Pipeline completado correctamente.'
        }
        failure {
            echo '❌ El pipeline ha fallado.'
        }
    }
}

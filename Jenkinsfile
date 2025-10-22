pipeline {
    agent any

    tools {
        // Install the Maven version configured as "M3" and add it to the path.
        maven "MAVEN_HOME"
    }

    stages {
        stage('Clone') {
            steps {
                timeout(time: 2, unit: 'MINUTES'){
                    git branch: 'main', credentialsId: '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', url: 'https://github.com/josephmiguel1103/sys_certificado.git'
                }
            }
        }
        stage('Build') {
            steps {
                timeout(time: 8, unit: 'MINUTES'){
                    sh "mvn -DskipTests clean package -f SysAlmacen/pom.xml"
                }
            }
        }
        stage('Test') {
            steps {
                timeout(time: 10, unit: 'MINUTES'){
                    // Se cambia <test> por <install> para que se genere el reporte de jacoco
                    sh "mvn clean install -f SysAlmacen/pom.xml"
                }
            }
        }
        stage('Sonar') {
            steps {
                timeout(time: 4, unit: 'MINUTES'){
                    withSonarQubeEnv('sonarqube'){
                        sh "mvn org.sonarsource.scanner.maven:sonar-maven-plugin:3.9.0.2155:sonar -Pcoverage -f SysAlmacen/pom.xml"
                    }
                }
            }
        }
        stage('Quality gate') {
            steps {

                sleep(10) //seconds

                timeout(time: 4, unit: 'MINUTES'){
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        stage('Deploy') {
            steps {
			    timeout(time: 8, unit: 'MINUTES'){
					// Ejecutar mvn spring-boot:run
					echo "mvn spring-boot:run -f SysAlmacen/pom.xml"
                }			
                //echo "mvn spring-boot:run -f SysAlmacen/pom.xml"
            }
        }
    }
}
pipeline {
    // Defines where the pipeline will execute. 'any' means any available Jenkins agent.
    agent any 

    // Defines the different phases of the pipeline
    stages {
        stage('Build') {
            steps {
                // Commands to build your application
                echo 'Building the application...'
                // Example: sh 'npm install' or sh 'mvn clean package'
            }
        }
        stage('Test') {
            steps {
                // Commands to run your tests
                echo 'Running unit tests...'
                // Example: sh 'npm test'
            }
        }
        stage('Deploy') {
            // Optional condition: Only deploy if the branch is 'main'
            when {
                branch 'main'
            }
            steps {
                // Commands to deploy your application
                echo 'Deploying to staging environment...'
                // Example: sh './deploy.sh'
            }
        }
    }
    
    // Post-actions run after the stages complete
    post {
        always {
            echo 'This will always run, regardless of success or failure. Good for cleanups.'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed. Sending alerts...'
        }
    }
}

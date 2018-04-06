
properties([
    parameters([
        booleanParam(name: 'WITH_CLIQZ_MASTER', defaultValue: false, description: 'Builds with latest Cliqz master')
    ])
])

node('docker') {
    stage ('Checkout') {
        checkout scm
    }

    def img
    def artifact

    stage('Build Docker Image') {
        img = docker.build('ghostery/build', '--build-arg UID=`id -u` --build-arg GID=`id -g` .')
    }

    stage('Build Extension') {
        img.inside() {
                withCache {
                    sh 'rm -r build'
                    if (params.WITH_CLIQZ_MASTER) {
                        sh 'npm install --save https://s3.amazonaws.com/cdncliqz/update/edge/ghostery/master/latest.tgz'
                    }
                    sh 'moab makezip'
                    // get the name of the firefox build
                    artifact = sh(returnStdout: true, script: 'ls build/ | grep firefox').trim()
                }
        }
    }

    stage('Publish') {
        withCredentials([[
                $class: 'UsernamePasswordMultiBinding',
                credentialsId: '06ec4a34-9d01-46df-9ff8-64c79eda8b14',
                passwordVariable: 'AWS_SECRET_ACCESS_KEY',
                usernameVariable: 'AWS_ACCESS_KEY_ID']]) {
            echo "${env.BRANCH_NAME}/${env.BUILD_NUMBER}"
            def uploadLocation = "s3://cdncliqz/update/ghostery/nightly_test/${env.BRANCH_NAME}/${env.BUILD_NUMBER}/${artifact}"
            currentBuild.description = uploadLocation
            sh "aws s3 cp build/${artifact} ${uploadLocation}  --acl public-read"
        }
    }
}

def withCache(Closure body=null) {
    def cleanCache = {
        sh 'rm -fr node_modules'
    }

    try {
        cleanCache()
        // Main dependencies
        sh 'cp -fr /home/jenkins/node_modules .'

        body()
    } finally {
        cleanCache()
    }
}

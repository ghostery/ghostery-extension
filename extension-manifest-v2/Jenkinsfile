
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
    def uploadPath = "cdncliqz/update/ghostery/nightly_test/${env.BRANCH_NAME}/${env.BUILD_NUMBER}"

    stage('Build Docker Image') {
        img = docker.build('ghostery/build', '--build-arg UID=`id -u` --build-arg GID=`id -g` .')
    }

    stage('Build Extension') {
        img.inside() {
            withCache {
                sh 'rm -rf build'
                if (params.WITH_CLIQZ_MASTER) {
                    sh 'npm install --save https://s3.amazonaws.com/cdncliqz/update/edge/ghostery/master/latest.tgz'
                }
                // make browser-core noisy
                sh 'sed -i \'s/global.__DEV__/true/1\' node_modules/browser-core/build/core/console.js'
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
            def uploadLocation = "s3://${uploadPath}/${artifact}"
            currentBuild.description = uploadLocation
            sh "aws s3 cp build/${artifact} ${uploadLocation}  --acl public-read"
        }
    }

    stage('Sign and Publish') {
        def artifactUrl = "https://s3.amazonaws.com/${uploadPath}/${artifact}"
        build job: 'addon-repack', parameters: [
            string(name: 'XPI_URL', value: artifactUrl),
            string(name: 'XPI_SIGN_CREDENTIALS', value: '41572f9c-06aa-46f0-9c3b-b7f4f78e9caa'),
            string(name: 'XPI_SIGN_REPO_URL', value: 'git@github.com:cliqz/xpi-sign.git')
        ]
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

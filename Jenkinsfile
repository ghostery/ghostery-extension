node('docker') {
    stage ('Checkout') {
        checkout scm
    }

    def img

    stage('Build Docker Image') {
        img = docker.build('ghostery/build', '--build-arg UID=`id -u` --build-arg GID=`id -g` .')
        // clean workdir
        sh 'rm -rf build ghostery-*'
    }

    stage('Build sign and publish') {
        img.inside() {
            withCache {
                sh 'rm -rf build'
                withGithubCredentials {
                    sh 'moab makezip production'
                }
            }
        }
        withS3Credentials {
            // get the name of the firefox build
            def artifact = sh(returnStdout: true, script: 'ls build/ | grep firefox').trim()

            // build
            def uploadPath = "cdncliqz/update/android_browser_pre/firefox@ghostery.com"
            def uploadLocation = "s3://${uploadPath}"
            currentBuild.description = uploadLocation
            sh "aws s3 cp build/${artifact} ${uploadLocation}/  --acl public-read"

            // publish
            def artifactUrl = "https://s3.amazonaws.com/${uploadPath}/${artifact}"
            build job: 'addon-repack', parameters: [
                string(name: 'XPI_URL', value: artifactUrl),
                string(name: 'XPI_SIGN_CREDENTIALS', value: '41572f9c-06aa-46f0-9c3b-b7f4f78e9caa'),
                string(name: 'XPI_SIGN_REPO_URL', value: 'git@github.com:cliqz/xpi-sign.git'),
                string(name: 'CHANNEL', value: 'android_browser')
            ]
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

def withGithubCredentials(Closure body) {
    withCredentials([sshUserPrivateKey(
            credentialsId: '6739a36f-0b19-4f4d-b6e4-b01d0bc2e175',
            keyFileVariable: 'GHOSTERY_CI_SSH_KEY')
            ]) {
        // initialise git+ssh access using ghostery-ci credentials
        try {
            sh '''#!/bin/bash -l
                set -x
                set -e
                mkdir -p ~/.ssh
                cp $GHOSTERY_CI_SSH_KEY ~/.ssh/id_rsa
                chmod 600 ~/.ssh/id_rsa
                ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts
            '''
            body()
        } finally {
            sh 'rm -f ~/.ssh/id_rsa'
            sh 'rm -f ~/.ssh/known_hosts'
        }
    }
}

def withS3Credentials(Closure body) {
    withCredentials([[
            $class: 'UsernamePasswordMultiBinding',
            credentialsId: '06ec4a34-9d01-46df-9ff8-64c79eda8b14',
            passwordVariable: 'AWS_SECRET_ACCESS_KEY',
            usernameVariable: 'AWS_ACCESS_KEY_ID']]) {
        body()
    }
}

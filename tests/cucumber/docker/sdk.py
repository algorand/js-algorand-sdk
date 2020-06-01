#!/usr/bin/env python3

import subprocess
import sys

default_dirs = { 
    'features_dir': '/opt/js-algorand-sdk/tests/cucumber/features',
    'source': '/opt/js-algorand-sdk',
    'docker': '/opt/js-algorand-sdk/tests/cucumber/docker',
    'steps': '/opt/js-algorand-sdk/tests/cucumber/steps'
}

def setup_sdk():
    """
    Setup js cucumber environment.
    """    
    subprocess.check_call(['npm install --silent'], shell=True, cwd=default_dirs['source'])
    subprocess.check_call(['npm install %s --silent' % default_dirs['source']], shell=True)

def test_sdk():
    sys.stdout.flush()
    
    subprocess.check_call(['node_modules/.bin/cucumber-js %s --require %s/*' % (default_dirs["features_dir"], default_dirs["steps"])], shell=True)
    # subprocess.check_call(['mvn test -Dcucumber.options="--tags @template"'], shell=True, cwd=sdk.default_dirs['cucumber'])
    # subprocess.check_call(['mvn test -Dcucumber.options="/opt/sdk-testing/features/template.feature"'], shell=True, cwd=sdk.default_dirs['cucumber'])

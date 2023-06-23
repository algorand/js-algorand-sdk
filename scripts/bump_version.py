# This script bumps up the version in `pom.xml` and `README.md` for new releases.
# Usage: python bump_version.py {new_version} (--new_hash <INTEGRITY-HASH>
# --read_me <path-to-README.md> --package_json <path-to-package.json>
# --package-lock_json <path-to-package-lock.json>)

import argparse
import re
import json
import sys

def check_version(new_version):
    if not re.fullmatch(r"[0-9]+\.[0-9]+\.[-a-z.0-9]+", new_version):
        sys.exit("The version does not match the regex(major.minor.patch): [0-9]+\.[0-9]+\.[-a-z.0-9]+")

def bump_package_json(new_version, file_path):
    with open(file_path, "r") as file:
        content = json.load(file)

    content["version"] = new_version

    with open(file_path, "w") as file:
        json.dump(content, file, indent=2)

def bump_package_lock_json(new_version, file_path):
    with open(file_path, "r") as file:
        content = json.load(file)

    content["version"] = new_version
    content["packages"][""]["version"] = new_version

    with open(file_path, "w") as file:
        json.dump(content, file, indent=2)

def update_read_me(new_version, new_hash, file_path):
    with open(file_path, "r") as file:
        content = file.read()

    # Replace version
    new_content = re.sub(
        'algosdk@v[0-9]+\.[0-9]+\.[-a-z.0-9]+',
        f'algosdk@v{new_version}',
        content,
    )
    # Replace hash
    new_content = re.sub(
        'integrity="sha384-.*?"',
        f'integrity="sha384-{new_hash}"',
        new_content
    )

    with open(file_path, "w") as file:
        file.write(new_content)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="updates the version for a release and the integrity hash in the README.md, package.json, and package-lock.json",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("new_version", help="new version as major.minor.patch")
    parser.add_argument(
        "--new_hash", required=True, help = "new integrity hash for the build"
    )
    parser.add_argument(
        "--package_json", default="package.json", help="path to package.json"
    )
    parser.add_argument(
        "--package_lock_json", default="package-lock.json", help="path to package-lock.json"
    )
    parser.add_argument(
        "--read_me", default="README.md", help="path to readme"
    )

    args = parser.parse_args()
    check_version(args.new_version)
    bump_package_json(args.new_version, args.package_json)
    bump_package_lock_json(args.new_version, args.package_lock_json)
    update_read_me(args.new_version, args.new_hash, args.read_me)

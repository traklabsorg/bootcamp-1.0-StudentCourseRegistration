git submodule init
git submodule update --init --remote
git submodule update --init --recursive
cd submodules/
cd platform-3.0-Entities/
git merge master
git checkout master	
git pull
cd submodules/
cd platform-3.0-Framework/
git merge master
git checkout master
git pull
cd submodules/platform-3.0-Common/
git merge master
git checkout master
git pull
cd ../../../../../platform-3.0-Dtos/
git merge master
git checkout master
git pull
cd submodules/platform-3.0-Common/
git merge master
git checkout master
git pull
cd ../../../platform-3.0-Mappings/
git merge master
git checkout master
git pull
cd ../platform-3.0-Aws/
git merge master
git checkout master
git pull
cd../

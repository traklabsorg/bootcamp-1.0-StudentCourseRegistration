In order to start the project, from the root folder you need to run

npm start --> This will generate the .js file inside the build folder and run the web server at port 3000
Warning: If there is some versioning issue with npm install then run the following command: => npm i -g npm@latest And then run npm install

//Migration

1. Run the following command to generate migration: ./node_modules/.bin/ts-node ./node_modules/.bin/typeorm migration:generate -n <migration_file_name> OR typeorm migration:generate -n <migration_file_name>

2. Once you have generated the migration file do the following: --> npm start

3. Then write folllowing command to run migration: ./node_modules/.bin/ts-node ./node_modules/.bin/typeorm migration:run OR typeorm migration:run

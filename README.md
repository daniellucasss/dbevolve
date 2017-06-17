# DBEvolve

A basic database source control made for use with PostgreSQL.

## How to use
```
npm install --save-dev dbevolve
```
After that you'll need to create a JSON file called 'dbevolve.config.json' as the example below:
```
{
    "url": "postgres://postgres@localhost:5432/test",
    "scripts": [
        { "author": "test", "script": "CREATE TABLE TEST(ID INT PRIMARY KEY NOT NULL, TEST TEXT);"},
        { "author": "test", "script": "CREATE TABLE TESTING(ID INT PRIMARY KEY NOT NULL, TEST TEXT);"}
}
```
The name 'url' its a reference to the url of your database and its value is a STRING.
The name 'scripts' its a reference to the scripts you want to run in your database, its value is an ARRAY of OBJECT and its OBJECT must contains an 'author' and a 'script'.

And runs:
```
node /node_modules/dbevolve
```
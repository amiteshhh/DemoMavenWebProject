# Sample maven project

This project demonstrate how you can integrate the [node](https://nodejs.org/) based build system into [maven](https://maven.apache.org/) using maven plugin [frontend-maven-plugin](https://github.com/eirslett/frontend-maven-plugin).

## Use Case

Front end developer prefers the _node_ based ecosystem which comes with many handy tools like [npm](https://www.npmjs.com/), [Grunt](http://gruntjs.com/), [Gulp](http://gulpjs.com/) and many more to manage application development, code validation, test automation, optimization, deployment etc.

However If you want to integrate it into Java Project to deploy it as a [WAR](https://en.wikipedia.org/wiki/WAR_(file_format)) , you must put the entire front-end code-base into appropriate directory of Java project (normally under `WebContent` or `webapp` folder). Unfortunately Java build system doesn't have inbuilt support to invoke _node_ commands and therefore you will not only lose the various optimization, validations that you were able to do in _node_ ecosystem but also it will look ugly and unmanageable to put everything inside `webapp` directory.

>Manually copying the the optimized/compiled/validated front-end code to appropriate directory of Java project is time consuming and painful.

## Solution

Fortunately there are many maven plugins available which can run the _node_ command. One such plugin is [frontend-maven-plugin](https://github.com/eirslett/frontend-maven-plugin).

This plugin downloads/installs Node and NPM locally for your project, runs npm install, and then any combination of Bower, Grunt, Gulp, Jspm, Karma, or Webpack.

All we need to do is additionally write appropriate grunt/gulp task to copy the front-end code to appropriate Java directory( `webapp` folder in maven based project)

## Example

This sample project is built using maven and Grunt for client task automation.

### __Step 1:__ Dynamic Java Website Project Creation Using Maven
> Skip if you have already done.

I will be using `maven` command to create a Maven Project. You can also use `eclipse` to create Maven project. 

Run command in the directory under which you want to keep your project

`mvn archetype:generate -DgroupId=com.demo.java -DartifactId=DemoMavenWebProject -DarchetypeArtifactId=maven-archetype-webapp -DinteractiveMode=false`

This will create a project with folder named `DemoMavenWebProject`
Refer Maven directory structure for detail

```
├── DemoMavenWebProject/
│   └── src/
│       └── main/
│           └── webapp/
│   └── pom.xml

```

### __Step 2:__ Create the front-end node project 

Preferebly create a folder named `client` under root folder `DemoMavenWebProject` and put all your client code inside this. 

### __Step 3:__ Create Grunt task to  be run during maven build

Grunt task has been created to concatanate, minify and uglify the source code into `dest` directory along-with copying static assets.

During maven build we will do all this and copy the `dest` directory content into `webapp` directory using `copy:mvn` task.

 
```js
grunt.registerTask('default', ['clean:build', 'copy:staticFiles', 'min-build']);
grunt.registerTask('build', ['default']);
grunt.registerTask('mvn-build', ['build', 'clean:mvn', 'copy:mvn']);

```

> The Grunt task is minimal as our primary concern is to integrate it into maven.

### __Step 4:__ Install `grunt-cli` locally

Since maven plugin runs the command in local _node_ environment `grunt-cli` must be a part of the node project so that it can recognize `grunt` command.

Use `npm install grunt-cli --save-dev` to save it as a project dependency.

### __Step 5:__ Modify `pom.xml` to include the Grunt automation

This step is really simple. We just need to create a maven `<profile>` in the _pom.xml_ and mention the task which we want to execute.
Refer _pom.xml_ of the project or see the [frontend-maven-plugin](https://github.com/eirslett/frontend-maven-plugin) documentation. 

Here is an equivalent setup to invoke `grunt mvn-build` command from maven.

```xml
<execution>
    <id>grunt build</id><!-- just a name -->
    <goals>
        <goal>grunt</goal><!-- command -->
    </goals>
    <configuration>
        <arguments>mvn-build</arguments> <!-- command argument-->
    </configuration>
</execution>

```

> Since Grunt itself depends on node and npm we must setup maven to install that prior to invoking this command.

>`frontend-maven-plugin` plugin does not support already installed Node or npm versions. This is partly because the build should not be affected if run in different machines.

Plugin create a folder `node` inside `client` directory to setup the local node and npm.

You can manually copy _node.exe_ in the `node` directory and maven will take it up from there instead of downloading it from server.

### __Step 5:__ Build Project using maven

For this project I have created a _profile_ `fullBuild` in _pom.xml_ to run the Grunt Task, copy the minified code into `webapp` and generate the [WAR](https://en.wikipedia.org/wiki/WAR_(file_format)) to deploy it over server.

Run the command `mvn clean install -P fullBuild`


## Maven Troubleshoot

__1) mvn command not working__

- Ensure that Maven `bin`  and `jdk` directory added to system/user environment _path_ variable
- Create `JAVA_HOME` environment variable pointing to `jdk` directory.

__2) mvn command unable to download the package due to proxy__

- Ensure that the maven repository Url is accessible through Browserto rule out url blockage.
- If you are behind corporate proxy, configure proxy as described below

    Maven download the package in a special folder `.m2` in the user home directory (typically `C:\Users\[Your_User_Id]\.m2` folder).
    Create/Edit the file `settings.xml` inside it to add proxy and repositories detail.
    
    Refer the sample [Gist](https://gist.github.com/amiteshhh/629e9a3a49e035a6d0709172eb435145) and [Maven proxy configuration](https://maven.apache.org/guides/mini/guide-proxies.html) documentation for `settings.xml` details.
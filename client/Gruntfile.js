module.exports = function (grunt) {


    /* Path of files/folders. You can put these into separate build.confif.js file*/

    var pathConfig = {
        distDir: 'dist',
        srcDir: 'src',
        htmlFiles: ['index.html', 'app/**/*.html'],//relative to srcDir
        //jsFiles: ['src/app/**/*.js', '!src/app/**/*.spec.js'],

        // Part of the mvn copy/clean facilities.
        webappDir: './../src/main/webapp',//pom based directory structure
        //webappDir: './../WebContent',//classic java directory structure
        //webappFilesToBeCleaned: [this.webappDir + '/*', '!' + this.webappDir + '/META-INF', '!' + this.webappDir + '/WEB-INF', '.tmp']
    };

    pathConfig.webappFilesToBeCleaned = [pathConfig.webappDir + '/*', '!' + pathConfig.webappDir + '/META-INF', '!' + pathConfig.webappDir + '/WEB-INF', '.tmp'];

    var taskConfig = {
        pkg: grunt.file.readJSON("package.json"),

        clean: {
            build: [
                '<%= distDir %>', '.tmp'
            ],
            mvn: {
                src: '<%=webappFilesToBeCleaned%>',
                options: {
                    force: true
                }
            }
        },
        /**
         * The `copy` task just copies files from A to B. We use it here to copy
         * our project assets (images, fonts, etc.) and javascripts into
         * `distDir`
         */
        copy: {
            staticFiles: {
                files: [{
                    src: ['**'],
                    dest: '<%= distDir %>/img/',
                    cwd: 'src/img',
                    expand: true
                }, {//htmls
                    src: '<%= htmlFiles %>',
                    dest: '<%= distDir %>/',
                    cwd: 'src',
                    expand: true
                }]
            },
            mvn: {//htmls
                src: ['**'],
                dest: '<%= webappDir %>/',
                cwd: '<%= distDir %>',
                expand: true
            }
        },
        useminPrepare: {
            html: '<%= srcDir %>/index.html',
            options: {
                dest: '<%= distDir %>'
            }
        }, usemin: {
            html: '<%= distDir %>/index.html'
        },
        uglify: {
            options: {
                mangle: true,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("mmm dd, yyyy") %> */\n'
            }
        },
        htmlmin: {                                     // Task
            dist: {                                      // Target
                options: {                                 // Target options
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= distDir %>',
                    src: ['**/*.html'],
                    dest: '<%= distDir %>'
                }]

            }
        }

    };

    grunt.initConfig(grunt.util._.extend(taskConfig, pathConfig));

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-usemin');

    // simple build task
    grunt.registerTask('min-build', [
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        //'filerev',
        'usemin',
        'htmlmin'
    ]);

    grunt.registerTask('default', ['clean:build', 'copy:staticFiles', 'min-build']);
    grunt.registerTask('build', ['default']);
    grunt.registerTask('mvn-build', ['build', 'clean:mvn', 'copy:mvn']);
};
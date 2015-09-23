module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		clean: {
			dubtrack: {
				src: ['public/assets/js/dubtrack.js','public/assets/js/dubtrack.unwrap.js', 'public/assets/js/dubtrack.min.js']
			},
			dubtrack_includes: {
				src: ['public/assets/js/includes.min.js','public/assets/js/includes.js']
			},
			dubtrack_production: {
				src: ['public/assets/js/dubtrack.js','public/assets/js/includes.js']
			},
			dubtrack_after: {
				src: ['public/assets/js/dubtrack.unwrap.js']
			}
		},

		compass: {
			dubtrack: {
				options: {
					basePath: 'public/assets/',
					config: 'public/assets/config.rb',
				}
			},
			dubtrack_production: {
				options: {
					basePath: 'public/assets/',
					config: 'public/assets/config.rb',
					environment: 'production',
				}
			}
		},

		concat: {
			dubtrack_plugins: {
				src: ['public/assets/js/dubtrack/src/utils/plugins/*.js'],
				dest: 'public/assets/js/dubtrack/src/utils/plugins.js'
			},
			dubtrack: {
				src: [
					'public/assets/js/dubtrack/src/config.js',
					'public/assets/js/dubtrack/src/utils/*.js',
					'public/assets/js/dubtrack/src/models/**/*.js',
					'public/assets/js/dubtrack/src/collections/**/*.js',
					'public/assets/js/dubtrack/src/views/**/*.js',
					'public/assets/js/dubtrack/src/router.js',
					'public/assets/js/dubtrack/src/helpers.js'
				],
				dest: 'public/assets/js/dubtrack.unwrap.js',
			},
			dubtrack_includes: {
				src: [
					'public/assets/js/lib/jquery.1.9.1.min.js',
					'public/assets/js/lib/jquery-ui-1.10.0.custom.js',
					'public/assets/js/lib/jquery.mousewheel.js',
					'public/assets/js/lib/soundmanager2.js',
					'public/assets/js/lib/underscore.min.js',
					'public/assets/js/lib/backbone.min.js'
				],
				dest: 'public/assets/js/includes.js',
			},
		},

		wrap: {
			dubtrack: {
				src: ['public/assets/js/dubtrack.unwrap.js'],
				dest: 'public/assets/js/dubtrack.js',
				options: {
					wrapper: ['(function(w, $) {\n', '\n}(window, jQuery));']
				}
			}
		},

		uglify: {
			dubtrack: {
				src: 'public/assets/js/dubtrack.js',
				dest: 'public/assets/js/dubtrack.min.js',
			},
			dubtrack_includes: {
				src: 'public/assets/js/includes.js',
				dest: 'public/assets/js/includes.min.js'
			}
		},

		removelogging : {
			dubtrack : {
				src : 'public/assets/js/dubtrack.js'
			}
		},

		watch: {
			dubtrack_css: {
				files: ['public/assets/scss/**/*.scss'],
				tasks: ['compass:dubtrack', ],
				options: {
					spawn: false,
				}
			},
			dev_scripts: {
				files: ['Gruntfile.js', 'public/assets/js/dubtrack/src/**/*.js', 'public/assets/js/lib/*'],
				tasks: ['clean:dubtrack', 'clean:dubtrack_includes', 'concat', 'wrap:dubtrack'],
				options: {
					spawn: false,
				}
			},
		},
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('dev', [
		'clean:dubtrack',
		'concat:dubtrack_plugins',
		'concat',
		'wrap:dubtrack',
		'compass:dubtrack',
		'watch'
	]);

	grunt.registerTask('default', [
		'clean:dubtrack',
		'clean:dubtrack_includes',
		'concat',
		'wrap:dubtrack',
		'removelogging',
		'uglify',
		'clean:dubtrack_production',
		'compass:dubtrack_production',
		'clean:dubtrack_after'
	]);
};

const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const imagemin = require('gulp-imagemin');
const gcmq = require('gulp-group-css-media-queries');
const less = require('gulp-less');
const smartgrid = require('smart-grid');

const isDev = process.argv.indexOf('--dev') !== -1;
const isProd = !isDev;
const isSync = process.argv.indexOf('--sync') !== -1;

function html(){
	return gulp.src('./src/**/*.html')
				.pipe(gulp.dest('./build'))
				.pipe(gulpif(isSync, browserSync.stream()));
}

function styles(){
	return gulp.src('./src/css/+(styles|styles-nocalc|ie-9).less')
			   .pipe(gulpif(isDev, sourcemaps.init()))
			   .pipe(less())
			   .pipe(gcmq())
			   .pipe(autoprefixer({
		            browsers: ['> 0.1%'],
		            cascade: false
		        }))
			   .pipe(gulpif(isProd, cleanCSS({
		        	level: 2
		        })))
			   .pipe(gulpif(isDev, sourcemaps.write()))
			   .pipe(gulp.dest('./build/css'))
			   .pipe(gulpif(isSync, browserSync.stream()))
}

function images(){
	return gulp.src('./src/img/**/*')
			   //.pipe(imagemin())
			   .pipe(gulp.dest('./build/img'));
}

function fonts(){
	return gulp.src('./src/fonts/**/*')
				.pipe(gulp.dest('./build/fonts'));
}

function clear(){
	return del('build/*');
}

function watch(){
	if(isSync){
		browserSync.init({
			server: {
				baseDir: './build/'
			}
		});
	}

	gulp.watch('./smartgrid.js', grid);
	gulp.watch('./src/css/**/*.less', styles);
	gulp.watch('./src/**/*.html', html);
	gulp.watch('./src/fonts/**/*.*', fonts);
}

function grid(done){
	delete require.cache[require.resolve('./smartgrid.js')];
	let gridOptions = require('./smartgrid.js');
	smartgrid('./src/css', gridOptions);
  
	gridOptions.offset = '2.7%';
	gridOptions.filename = 'smart-grid-nocalc'; //  для генерации сетки без calc	
	smartgrid('./src/css', gridOptions);

	done();
}

const build = gulp.series(clear, 
						gulp.parallel(html, styles, images, fonts)
					);

gulp.task('build', build);
gulp.task('watch', gulp.series(build, watch));
gulp.task('grid', grid);
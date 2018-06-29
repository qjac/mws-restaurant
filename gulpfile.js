// from gulpjs.org
const gulp = require('gulp');

// used to figure out syntax for multiple sizes: https://stackoverflow.com/questions/30583051/gulp-image-resize-with-multiple-images, couldn't quite get it to work
// heavily modified responsive image set up from
// https://www.webstoemp.com/blog/responsive-images-pipeline-with-gulp/
// another post I used and butchered code from
// from https://jonathanmh.com/image-resizing-gulp/
// not much remains from the experimewnts using the above posts...
// but there are micro-snippets and syntax that remain like 'img/*.*'

// QUESTION: I tried to get all of the img tasks to be in the same task,
// but kept getting weird uotputs (1 img name 1-400-600-800.jpg). I couldn't find any helpfulm info on how to chain them into a single task. Is that possible? Is it recommeneded?

const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageResize = require('gulp-image-resize');
const rename = require('gulp-rename');
const gm = require('gm');

gulp.task('img-sm', function() {
  return (gulp
      .src('img/*.*')
      // smallest file size
      .pipe(imageResize({ width: 400 }))
      .pipe(
        imagemin({
          interlaced: true,
          progressive: true
        })
      )
      // found Mozjpeg stuff on google developer docs on automating image optimization
      .pipe(
        imagemin([
          imageminMozjpeg({
            quality: 85
          })
        ])
      )
      .pipe(
        rename({
          suffix: '-400'
        })
      )
      .pipe(gulp.dest('img/img-opt')) );
});

gulp.task('img-md', function() {
  return (gulp
      .src('img/*.*')
      .pipe(imageResize({ width: 600 }))
      .pipe(
        imagemin({
          interlaced: true,
          progressive: true
        })
      )
      // found Mozjpeg stuff on google developer docs on automating image optimization
      .pipe(
        imagemin([
          imageminMozjpeg({
            quality: 85
          })
        ])
      )
      .pipe(
        rename({
          suffix: '-600'
        })
      )
      .pipe(gulp.dest('img/img-opt')) );
});

gulp.task('img-lg', function() {
  return (gulp
      .src('img/*.*')
      .pipe(imageResize({ width: 800 }))
      .pipe(
        imagemin({
          interlaced: true,
          progressive: true
        })
      )
      // found Mozjpeg stuff on google developer docs on automating image optimization
      .pipe(
        imagemin([
          imageminMozjpeg({
            quality: 85
          })
        ])
      )
      .pipe(
        rename({
          suffix: '-800'
        })
      )
      .pipe(gulp.dest('img/img-opt')) );
});

gulp.task('img-full', function() {
  return (gulp
      .src('img/*.*')
      .pipe(
        imagemin({
          interlaced: true,
          progressive: true
        })
      )
      // found Mozjpeg stuff on google developer docs on automating image optimization
      .pipe(
        imagemin([
          imageminMozjpeg({
            quality: 95
          })
        ])
      )
      .pipe(
        rename({
          suffix: '-full'
        })
      )
      .pipe(gulp.dest('img/img-opt')) );
});

// // Default Task
// // gulp.task('default', ['lint', 'sass', 'scripts', 'watch']);
// // from https://travismaynard.com/writing/getting-started-with-gulp

// here's where I got the .parallel and learned to update my gulp -v
// https://blog.wearewizards.io/migrating-to-gulp-4-by-example
gulp.task('default', gulp.parallel('img-sm', 'img-md', 'img-lg', 'img-full'));

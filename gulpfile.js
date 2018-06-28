// // from gulpjs.org
// const gulp = require('gulp');

// // responsive image set up from
// // https://www.webstoemp.com/blog/responsive-images-pipeline-with-gulp/
// // const del = require('del');
// const deleteEmpty = require('delete-empty');
// // const globby = require('globby');
// // const gulpImagemin = require('gulp-imagemin');
// const gulpImageresize = require('gulp-image-resize');
// // const gulpNewer = require('gulp-newer');
// // const merge2 = require('merge2');

// // TODO: update fields to be specific to THIS project
// const transforms = [
//   {
//     src: './img/*',
//     dist: './img/img-opt/',
//     params: {
//       width: 800,
//       quality: 0.7,
//       // format: jpeg,
//       sharpen: true,
//       interlace: true
//       // background: none
//     }
//     // },
//     // {
//     //   src: './img/*',
//     //   dist: './img/img-opt/',
//     //   params: {
//     //     width: 600,
//     //     quality: 0.7,
//     //     // format: jpeg,
//     //     sharpen: true,
//     //     interlace: true
//     //     // background: none
//   }
//   // },
//   // {
//   //   src: './img/*',
//   //   dist: './img/img-opt/',
//   //   params: {
//   //     width: 400,
//   //     quality: 0.7,
//   //     // format: jpeg,
//   //     sharpen: true,
//   //     interlace: true
//   //     // background: none
//   //   }
//   // }
// ];

// // from gulpjs.org
// gulp.task('img', function() {
//   return transforms;
// });

// // gulp.task('default', function() {
// //   console.log('Hello World!');
// // });

// // Default Task
// // gulp.task('default', ['lint', 'sass', 'scripts', 'watch']);
// // from https://travismaynard.com/writing/getting-started-with-gulp
// // gulp.task('default', ['img']);

// from https://jonathanmh.com/image-resizing-gulp/
// var gulp = require('gulp');
// var gm = require('gulp-gm');
// var newer = require('gulp-newer');
// var imagemin = require('gulp-imagemin');

// gulp.task('default', function() {
//   gulp
//     .src('img/**/*.*')
//     .pipe(newer('resized'))
//     .pipe(
//       gm(function(gmfile) {
//         gmfile.setFormat('jpg').quality(90);
//         return gmfile.resize(600, 500);
//       })
//     )
//     .pipe(imagemin())
//     .pipe(gulp.dest('resized'));
// });

const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageResize = require('gulp-image-resize');
const rename = require('gulp-rename');
// const gm = require('gm').subClass({ imageMagick: true });
var fs = require('fs'),
  gm = require('gm').subClass({ imageMagick: true });

// ftom google dev docs on img optimization
// gulp.task('img', function() {
//   return gulp
//     .src('img/*')
//     .pipe(
//       imagemin({
//         interlaced: true,
//         progressive: true,
//         optimizationLevel: 5
//       })
//     )
//     .pipe(
//       imagemin([
//         imageminMozjpeg({
//           quality: 85
//         })
//       ])
//     )
//     .pipe(gulp.dest('dist-img'));
// });

gulp.task('img', function() {
  return (gulp
      .src('img/*')
      // smallest file size
      // used to figure out syntax for multiple sizes: https://stackoverflow.com/questions/30583051/gulp-image-resize-with-multiple-images
      .pipe(imageResize({ width: 400 }))
      .pipe(
        imagemin({
          interlaced: true,
          progressive: true,
          optimizationLevel: 5
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
      // .pipe(gulp.dest('img/img-opt'))
      .pipe(
        rename({
          suffix: '-400'
        })
      )
      // mid size
      .pipe(imageResize({ width: 600 }))
      .pipe(
        imagemin({
          interlaced: true,
          progressive: true,
          optimizationLevel: 5
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
      // .pipe(gulp.dest('img/img-opt'))
      .pipe(
        rename({
          suffix: '-600'
        })
      )
      // large size (most likely same dimensions as orig)
      .pipe(imageResize({ width: 800 }))
      .pipe(
        imagemin({
          interlaced: true,
          progressive: true,
          optimizationLevel: 5
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
      // .pipe(gulp.dest('img/img-opt'))
      .pipe(
        rename({
          suffix: '-800'
        })
      )
      .pipe(gulp.dest('img/img-opt')) );
});

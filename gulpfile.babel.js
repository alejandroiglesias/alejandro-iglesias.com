// generated on 2015-12-11 using generator-gulp-webapp 1.0.3
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';
import axis from 'axis';
import lost from 'lost';
import poststylus from 'poststylus';
import rucksack from 'rucksack-css';
import rupture from 'rupture';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () => {
  return gulp.src('src/styles/main.styl')
    .pipe($.sourcemaps.init())
    .pipe($.stylus({use: [axis(), poststylus([lost(), rucksack({autoprefixer: true})]), rupture()]}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
const testLintOptions = {
  env: {
    mocha: true
  }
};

gulp.task('lint', lint('src/scripts/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('jade', () => {
  return gulp.src('src/*.jade')
    .pipe($.jade({pretty: true}))
    .pipe(gulp.dest('.tmp'))
    .pipe(reload({stream: true}));
});

gulp.task('html', ['jade', 'styles'], () => {
  return gulp.src(['src/*.html', '.tmp/*.html'])
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('public'));
});

gulp.task('images', () => {
  return gulp.src('src/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest('public/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')({
    filter: '**/*.{eot,svg,ttf,woff,woff2}'
  }).concat('src/fonts/**/*').concat('bower_components/Font-Awesome-Stylus/fonts/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('public/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'src/*',
    '!src/*.html',
    '!src/*.jade'
  ], {
    dot: true
  }).pipe(gulp.dest('public'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'public']));

gulp.task('serve', ['jade', 'styles', 'fonts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'src'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'src/*.html',
    '.tmp/*.html',
    'src/scripts/**/*.js',
    'src/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('src/**/*.jade', ['jade']);
  gulp.watch('src/styles/**/*.styl', ['styles']);
  gulp.watch('src/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:public', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['public']
    }
  });
});

gulp.task('serve:test', () => {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('src/styles/*.styl')
    .pipe(wiredep({
      //ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('src/styles'));

  gulp.src(['src/*.html', 'src/*.jade'])
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('src'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('public/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('deploy', function() {
  return gulp.src('./public/**/*')
    .pipe($.ghPages());
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});

var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),//js压缩
    less = require('gulp-less'), //less
    csslint = require('gulp-csslint'),//检测css
    rev = require('gulp-rev'), 
    minifyCss = require('gulp-minify-css'),  //css压缩
    changed = require('gulp-changed'),
    jshint = require('gulp-jshint'), //js检查
    stylish = require('jshint-stylish'),
    revCollector = require('gulp-rev-collector'),
    minifyHtml = require('gulp-minify-html'), //压缩html
    autoprefixer = require('gulp-autoprefixer'),
    amdOptimize = require('amd-optimize'),
    rjs = require('gulp-requirejs'),
    del = require('del'); //删除文件



var cssSrc = 'src/css/**/*.less',
    cssDest = 'dist/css',
    jsSrc = 'src/js/**/*',
    jsDest = 'dist/js',
    fontSrc = 'src/fonts/*',
    fontDest = 'dist/font',
    imgSrc = 'src/images/**/*',
    imgDest = 'dist/images',
    cssRevSrc = 'src/cssRevSrc',
    condition = true;

var opt = {
    baseUrl: 'src/js/modules',
    paths: {
        jquery: 'jquery/jquery-1.11.2.min',
        'jquery.lazyload': 'jquery/jquery.lazyload',
        'jquery.validate': 'jquery/jquery.validate.min',
        'jquery.sides': 'jquery/jquery.sides',
        'jquery.datetimepicker': 'jquery/amazeui.datetimepicker.min',
        'selectivity': 'jquery/selectivity.min',
        'jquery.ui.widget': 'jquery/jquery.ui.widget',
        'jquery.fileupload': 'jquery/jquery.fileupload',
        'wangEditor': 'wangEditor/js/wangEditor-1.3.12.min',
        'plupload': 'wangEditor/js/plupload.full.min'
    },
    shim: {
        'jquery.lazyload': ['jquery'],
        'jquery.validate': ['jquery'],
        'selectivity': ['jquery'],
        'jquery.ui.widget': ['jquery'],
        'jquery.sides': ['jquery'],
        'jquery.datetimepicker': ['jquery']
    }
};

/*function changePath(basePath){
    var nowCssSrc = [];
    for (var i = 0; i < cssSrc.length; i++) {
        nowCssSrc.push(cssRevSrc + '/' + cssSrc[i]);
    }
    return nowCssSrc;
}*/

//Fonts & Images 根据MD5获取版本号
gulp.task('revFont', function(){
    return gulp.src(fontSrc)
        .pipe(rev())
        .pipe(gulp.dest(fontDest))
        .pipe(rev.manifest({merge: true}))
        .pipe(gulp.dest('src/rev/font'));
});
gulp.task('revImg', function(){
    return gulp.src(imgSrc)
        .pipe(rev())
        .pipe(gulp.dest(imgDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('src/rev/img'));
});

//检测JS
gulp.task('lintJs', function(){
    /*return gulp.src(jsSrc)
        //.pipe(jscs())   //检测JS风格
        .pipe(jshint({
            "undef": false,
            "unused": false
        }))
        //.pipe(jshint.reporter('default'))  //错误默认提示
        .pipe(jshint.reporter(stylish))   //高亮提示
        .pipe(jshint.reporter('fail'));*/
});

//压缩JS/生成版本号
//压缩JS/生成版本号
gulp.task('miniJs', function(){
    return gulp.src(jsSrc)
        .pipe(gulpif(
            condition, uglify()
        ))
        .pipe(rev())
        .pipe(gulp.dest(jsDest))
        .pipe(rev.manifest({merge: true}))
        .pipe(gulp.dest('src/rev/js'));
});

//CSS里更新引入文件版本号
gulp.task('revCollectorCss', function () {
    return gulp.src(['src/rev/**/*.json', 'src/css/**/*.less'])
        .pipe(revCollector())
        .pipe(gulp.dest('cssRevSrc'));
});

//检测CSS
gulp.task('lintCss', function(){
    return gulp.src(cssSrc)
        .pipe(csslint())
        .pipe(csslint.reporter())
        .pipe(csslint.failReporter());
});


//压缩/合并CSS/生成版本号
gulp.task('miniCss', function(){
    return gulp.src('cssRevSrc/**/*')
        .pipe(less())
        .pipe(rev())
        .pipe(gulp.dest(cssDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('src/rev/css'));
});

//压缩Html/更新引入文件版本
gulp.task('miniHtml', function () {
    return gulp.src(['src/rev/**/*.json', 'src/*.html'])
        .pipe( revCollector() )
        .pipe(gulpif(
            condition, minifyHtml({
                empty: true,
                spare: true,
                quotes: true
            })
        ))
        .pipe(gulp.dest('dist'));
});

gulp.task('delRevCss', function(){
    del([cssRevSrc,cssRevSrc.replace('src/', 'dist/')]);
})

//意外出错？清除缓存文件
gulp.task('clean', function(){
    del([cssRevSrc ,cssRevSrc.replace('src/', 'dist/')]);
})

//开发构建
gulp.task('dev', function (done) {
    condition = true;
    runSequence(
         ['revFont', 'revImg'],
         ['lintJs'],
         ['revCollectorCss'],
         ['miniCss', 'miniJs'],
         ['miniHtml', 'delRevCss'],
    done);
});

//正式构建
gulp.task('build', function (done) {
    runSequence(
         ['revFont', 'revImg'],
         ['lintJs'],
         ['revCollectorCss'],
         ['miniCss', 'miniJs'],
         ['miniHtml', 'delRevCss'],
    done);
});


gulp.task('default', ['build']);

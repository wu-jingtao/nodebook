const gulp = require("gulp");
const ts = require("gulp-typescript").createProject('tsconfig.json');
const sourcemaps = require('gulp-sourcemaps');

//编译服务器端TS代码
gulp.task("compileServer", function () {
    return gulp.src('src/Server/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(ts())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('bin/Server'));
});
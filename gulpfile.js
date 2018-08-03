const gulp = require("gulp");
const ts = require("gulp-typescript").createProject('tsconfig.json');

//编译服务器端TS代码
gulp.task("compileServer", function () {
    return gulp.src('src/Server/**/*.ts')
        .pipe(ts())
        .pipe(gulp.dest('bin/Server'));
});
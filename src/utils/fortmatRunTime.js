function fortmantRunTime(second) {
    let minus = Math.floor(second / 60);
    let _second = second % 60;
    if (minus < 10) {
        minus = `0${minus}`;
    }
    if (_second < 10) {
        _second = `0${_second}`;
    }
    return `${minus}:${_second}`;
}

export default fortmantRunTime;

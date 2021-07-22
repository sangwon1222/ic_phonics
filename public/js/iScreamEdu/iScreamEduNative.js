window.onBackPressed = function () {
    //
}

function popUpYes() {
    window.Android.exit();
}

function funcNo() {
    // funcNo
}

window.onPause = function () {
    console.log(".onCalledEvents .onPause");    
}
window.onResume = function () {
    console.log(".onCalledEvents .onResume");
}
window.onChangeHardKeyBoardState = function (n) {
    const tRslt = (n == 1) ? " on" : " off";
    console.log(".onCalledEvents .onChangeHardKeyBoardState " + tRslt);
}
window.onChangeSoftKeyBoardState = function (n) {
    const tRslt = (n == 1) ? " on" : " off";
    console.log(".onCalledEvents .onChangeSoftKeyBoardState " + tRslt);
}
getLcmsData = function (url) {
    // var url = json.xmlName
    var deferred = $.ajax({
        type: 'GET',
        url: url,
        cache: false,
        async: false,
        crossDomain: true,
        dataType: "jsonp",
        jsonpCallback: "SGE",
    }).done(function (data) {
        var json = data;
        return json;
    }).fail(function (data) {
        return '';
    });

}
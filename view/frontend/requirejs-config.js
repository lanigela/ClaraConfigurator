var config = {
    paths: {
        "claraplayer":  "https://clara.io/js/claraplayer.min",
        "cillowreact":  "http://exocortex.github.io/cillows/bundle.js",
    },
    shim: {
        "claraplayer": {
            exports: "claraplayer"
        },
        "cillowreact": {
            exports: "cillowreact"
        }
    },
    map: {
        '*': {
            clara_configurator:         'Exocortex_ClaraConfigurator/js/clara-configurator'
        }
    }
};

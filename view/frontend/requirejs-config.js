var config = {
    paths: {
        "claraplayer":  "https://clara.io/js/claraplayer.min",
        "cillowreact":  "js/main.d123122c",
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

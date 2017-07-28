var config = {
    paths: {
        "claraplayer":  "https://clara.io/js/claraplayer.min",
        "cillowreact":  "Exocortex_ClaraConfigurator/js/main.c46221a9"
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
            clara_configurator:         'Exocortex_ClaraConfigurator/js/clara-configurator',
            catalogAddToCart:           'Magento_Catalog/js/catalog-add-to-cart'
        }
    }
};

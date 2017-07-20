<?php
/**
 * Copyright © Exocortex, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
namespace Exocortex\ClaraConfigurator\Observer;

use Magento\Framework\Event\Observer as EventObserver;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Registry;
use Magento\Catalog\Api\ProductRepositoryInterface as ProductRepositoryInterface;
use Psr\Log\LoggerInterface as LoggerInterface;

class LayoutLoadBeforeObserver implements ObserverInterface
{
    private $_productRepository;
    private $_logger;
    private $_registry;
    /**
     * @param \Magento\Catalog\Api\ProductRepositoryInterface $productRepository
     */
    public function __construct(ProductRepositoryInterface $productRepository,
                                LoggerInterface $logger,
                                \Magento\Framework\Registry $registry)
    {
        $this->_productRepository = $productRepository;
        $this->_logger = $logger;
        $this->_registry = $registry;
    }

    /**
     * load clara.io player when claraUUID is set
     *
     * @param \Magento\Framework\Event\Observer $observer
     * @return void
     */
    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        $this->_logger->debug("LayoutLoadBeforeObserver executing");

        if ($observer->getData('full_action_name')=='catalog_product_view') {
            $this->_logger->debug("Matching action name succeed");
            /* @var $product \Magento\Catalog\Model\Product */
            $product = $this->_registry->registry('current_product');
            if ($product) {
                $this->_logger->debug("Product is not null");
                $attr = $product->getData('claraUUID');
                $this->_logger->debug($attr);
                if($attr && strcmp($attr, '')) {
                    $this->_logger.debug("Adding handle to layout");
                    $layout = $observer->getData('layout');
                    $layout->getUpdate()->addHandle('catalog_product_view_type_bundle_clara');
                }
            }
        }
    }
}

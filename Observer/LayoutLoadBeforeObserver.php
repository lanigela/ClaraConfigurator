<?php
/**
 * Copyright © Exocortex, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
namespace Exocortex\ClaraConfigurator\Observer;

use Magento\Framework\Event\Observer as EventObserver;
use Magento\Framework\Event\ObserverInterface;
use Magento\Catalog\Api\ProductRepositoryInterface as ProductRepositoryInterface;

class LayoutLoadBeforeObserver implements ObserverInterface
{
    private $_productRepository;
    /**
     * @param \Magento\Catalog\Api\ProductRepositoryInterface $productRepository
     */
    public function __construct(ProductRepositoryInterface $productRepository)
    {
        $this->_productRepository = $productRepository;
    }

    /**
     * load clara.io player when claraUUID is set
     *
     * @param \Magento\Framework\Event\Observer $observer
     * @return void
     */
    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        // apply to only bundle product for now
        if ($observer->getEvent()->getRequest()->getFullActionName()=='catalog_product_view_type_bundle') {
            /* @var $product \Magento\Catalog\Model\Product */
            $product = $observer->getEvent()->getProduct();
            if ($product) {
                $attr = $product->getData('claraUUID');
                if($attr && !strcmp($attr, '')) {
                    $layout = $observer->getData('layout');
                    $layout->getUpdate()->addHandle('catalog_product_view_type_bundle_clara');
                }
            }
        }
    }
}

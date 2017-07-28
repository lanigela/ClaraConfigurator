<?php
/**
 * Copyright © Exocortex, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

/**
 * Bundle product threekit configurator (Clara)
 *
 * @author      Daniel@Exocortex.com
 */
namespace Exocortex\ClaraConfigurator\Block;

class BundleClaraConfigurator extends \Magento\Framework\View\Element\Template
{
  /**
  * @param \Magento\Bundle\Block\Catalog\Product\View\Type\Bundle
  */
  private $bundle;

  /**
  * @param \Magento\Catalog\Block\Product\View
  */
  private $view;

  /**
  * @param \Magento\Catalog\Block\Product\Context
  * @param \Magento\Bundle\Block\Catalog\Product\View\Type\Bundle
  * @param \Magento\Catalog\Block\Product\View
  */
  public function __construct(
    \Magento\Catalog\Block\Product\Context $context,
    \Magento\Bundle\Block\Catalog\Product\View\Type\Bundle $bundle,
    \Magento\Catalog\Block\Product\View $view,
    array $data = [])
  {
    $this->bundle = $bundle;
    $this->view = $view;
    parent::__construct($context, $data);
  }

  public function getJsonConfig()
  {
    return $this->bundle->getJsonConfig();
  }

  public function getSubmitUrl($product, $additional = [])
  {
    return $this->view->getSubmitUrl($product, $additional);
  }
}
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

class BundleClaraConfigurator extends \Magento\Catalog\Block\Product\View\AbstractView
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
  * @param \Magento\Framework\Stdlib\ArrayUtils
  * @param \Magento\Bundle\Block\Catalog\Product\View\Type\Bundle
  * @param \Magento\Catalog\Block\Product\View
  */
  public function __construct(
    \Magento\Catalog\Block\Product\Context $context,
    \Magento\Framework\Stdlib\ArrayUtils $arrayUtils,
    \Magento\Bundle\Block\Catalog\Product\View\Type\Bundle $bundle,
    \Magento\Catalog\Block\Product\View $view,
    array $data = [])
  {
    $this->bundle = $bundle;
    $this->view = $view;
    parent::__construct($context, $arrayUtils, $data);
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

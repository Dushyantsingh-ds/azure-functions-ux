import { DefaultButton, IChoiceGroupOption, Icon, Link, PrimaryButton } from 'office-ui-fabric-react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RadioButtonNoFormik from '../../../components/form-controls/RadioButtonNoFormik';
import { PortalContext } from '../../../PortalContext';
import { ThemeContext } from '../../../ThemeContext';
import {
  gridBottomSelectedItemStyle,
  gridContainerStyle,
  planFeatureItemStyle,
  selectedGridItemStyle,
  unselectedGridItemStyle,
  radioButtonStyle,
  skuTitleStyle,
  skuDescriptionStyle,
  planFeaturesTitleStyle,
  skuTitleSelectedStyle,
  skuTitleUnselectedStyle,
  iconStyle,
  titleWithPaddingStyle,
  buttonFooterStyle,
  gridContextPaneContainerStyle,
  descriptionStyle,
  smallerTitleWithPaddingStyle,
  buttonPadding,
} from './StaticSiteSkuPicker.styles';
import { getTelemetryInfo } from '../../app/deployment-center/utility/DeploymentCenterUtility';
import { StaticSiteSku, StaticSiteSkuPickerProps } from './StaticSiteSkuPicker.types';
import { CommonConstants } from '../../../utils/CommonConstants';
import StaticSiteService from '../../../ApiHelpers/static-site/StaticSiteService';
import { getErrorMessage } from '../../../ApiHelpers/ArmHelper';
import { Links } from '../../../utils/FwLinks';

const StaticSiteSkuPicker: React.FC<StaticSiteSkuPickerProps> = props => {
  const { isStaticSiteCreate, currentSku, hasWritePermissions, resourceId, refresh } = props;
  const { t } = useTranslation();

  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);

  const [selectedSku, setSelectedSku] = useState<StaticSiteSku>(currentSku);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const selectButtonOnClick = () => {
    portalContext.log(getTelemetryInfo('verbose', 'applyButton', 'clicked', { selectedSku: selectedSku }));
    portalContext.closeSelf(selectedSku);
  };

  const saveButtonOnClick = async () => {
    portalContext.log(getTelemetryInfo('verbose', 'saveButton', 'clicked'));
    setIsSaving(true);

    const notificationId = portalContext.startNotification(t('staticSiteUpdatingHostingPlan'), t('staticSiteUpdatingHostingPlan'));

    const body = {
      properties: {},
      sku: {
        name: selectedSku,
        tier: selectedSku,
      },
    };

    const updateStaticSiteSkuResponse = await StaticSiteService.patchStaticSite(resourceId, body);

    if (updateStaticSiteSkuResponse.metadata.success) {
      portalContext.stopNotification(notificationId, true, t('staticSiteUpdatingHostingPlanSuccess'));
      refresh();
    } else {
      portalContext.log(getTelemetryInfo('error', 'updateStaticSiteSku', 'failed', { error: updateStaticSiteSkuResponse.metadata.error }));
      portalContext.stopNotification(
        notificationId,
        false,
        updateStaticSiteSkuResponse.metadata.error
          ? getErrorMessage(updateStaticSiteSkuResponse.metadata.error)
          : t('staticSiteUpdatingHostingPlanFailure')
      );
    }

    setIsSaving(false);
  };

  const isSaveButtonDisabled = () => {
    return (currentSku && currentSku === selectedSku) || isSaving || !hasWritePermissions;
  };

  const getFreeColumnClassname = (): string => {
    return selectedSku === StaticSiteSku.Free ? selectedGridItemStyle(theme) : unselectedGridItemStyle(theme);
  };

  const getStandardColumnClassname = (): string => {
    return selectedSku === StaticSiteSku.Standard ? selectedGridItemStyle(theme) : unselectedGridItemStyle(theme);
  };

  const getHeaderRow = (): JSX.Element => {
    return (
      <>
        <div className={planFeaturesTitleStyle(theme)} aria-label={t('staticSitePlanFeaturesAriaLabel')}>
          {t('staticSitePlanFeatures')}
        </div>
        {getSkuTitleSection(StaticSiteSku.Free, t('staticSiteFreePlanAriaLabel'), t('staticSiteFree'), t('staticSiteFreeDescription'))}
        {getSkuTitleSection(
          StaticSiteSku.Standard,
          t('staticSiteStandardPlanAriaLabel'),
          t('staticSiteStandard'),
          t('staticSiteStandardDescription')
        )}
      </>
    );
  };

  const getPriceRow = (): JSX.Element => {
    const pricingCalculatorLink = (
      <Link href={Links.staticWebAppsPricingCalculator} target="_blank" aria-hidden={true}>
        {t('staticWebAppSkuPickerCalculatePrice')}
      </Link>
    );
    return getGridMiddleRow(t('staticSitePrice'), t('staticSiteFree'), pricingCalculatorLink);
  };

  const getIncludedBandwidthRow = (): JSX.Element => {
    return getGridMiddleRow(
      t('staticSiteIncludedBandwidth'),
      t('staticSiteIncludedBandwidthAmount'),
      t('staticSiteIncludedBandwidthAmount')
    );
  };

  const getCustomDomainsRow = (): JSX.Element => {
    return getGridMiddleRow(t('staticSiteCustomDomains'), t('staticSiteFreeCustomDomainAmount'), t('staticSiteStandardCustomDomainAmount'));
  };

  const getSslCertificatesRow = (): JSX.Element => {
    return getGridMiddleRow(t('staticSiteSslCertificates'), t('staticSiteFree'), t('staticSiteFree'));
  };

  const getCustomAuthenticationRow = (): JSX.Element => {
    return getGridMiddleRow(
      t('staticSiteCustomAuthentication'),
      CommonConstants.Dash,
      <Icon iconName={'Accept'} className={iconStyle(theme)} />
    );
  };

  const getAppSizeRow = (): JSX.Element => {
    return getGridMiddleRow(t('staticSiteMaxAppSize'), t('staticSiteFreeAppSizeAmount'), t('staticSiteStandardAppSizeAmount'));
  };

  const getStagingEnvironmentsRow = (): JSX.Element => {
    return getGridMiddleRow(
      t('staticSiteStagingEnvironments'),
      t('staticSiteFreeStagingEnvironmentsAmount'),
      t('staticSiteStandardStagingEnvironmentsAmount')
    );
  };

  const getAzureFunctionsRow = (): JSX.Element => {
    return getGridBottomRow(
      t('staticSiteAzureFunctions'),
      t('staticSiteFreeAzureFunctionsAmount'),
      t('staticSiteStandardAzureFunctionsAmount')
    );
  };

  const getSkuTitleSection = (sku: string, radioButtonAriaLabel: string, skuTitle: string, skuDescription: string): JSX.Element => {
    return (
      <>
        <div className={selectedSku === sku ? skuTitleSelectedStyle(theme) : skuTitleUnselectedStyle(theme)}>
          <div className={radioButtonStyle}>
            <RadioButtonNoFormik
              id="static-site-sku"
              aria-label={radioButtonAriaLabel}
              selectedKey={selectedSku}
              options={[
                {
                  key: sku,
                  text: '',
                },
              ]}
              onChange={(e: any, configOptions: IChoiceGroupOption) => {
                const skuName =
                  configOptions.key.toLocaleLowerCase() === StaticSiteSku.Standard.toLocaleLowerCase()
                    ? StaticSiteSku.Standard
                    : StaticSiteSku.Free;
                setSelectedSku(skuName);
              }}
            />
          </div>
          <div className={skuTitleStyle} aria-hidden={true}>
            {skuTitle}
          </div>
          <div className={skuDescriptionStyle} aria-hidden={true}>
            {skuDescription}
          </div>
        </div>
      </>
    );
  };

  const getGridMiddleRow = (featureTitle: string, freeSkuValue: string, standardSkuValue: string | JSX.Element): JSX.Element => {
    return (
      <>
        <div className={planFeatureItemStyle(theme)} aria-hidden={true}>
          {featureTitle}
        </div>
        <div className={getFreeColumnClassname()} aria-hidden={true}>
          {freeSkuValue}
        </div>
        <div className={getStandardColumnClassname()} aria-hidden={true}>
          {standardSkuValue}
        </div>
      </>
    );
  };

  const getGridBottomRow = (featureTitle: string, freeSkuValue: string, standardSkuValue: string | JSX.Element): JSX.Element => {
    const isStandardSelected: boolean = selectedSku === StaticSiteSku.Standard;
    return (
      <>
        <div className={planFeatureItemStyle(theme)} aria-hidden={true}>
          {featureTitle}
        </div>
        <div className={!isStandardSelected ? gridBottomSelectedItemStyle(theme) : getFreeColumnClassname()} aria-hidden={true}>
          {freeSkuValue}
        </div>
        <div className={isStandardSelected ? gridBottomSelectedItemStyle(theme) : getStandardColumnClassname()} aria-hidden={true}>
          {standardSkuValue}
        </div>
      </>
    );
  };

  const getGridComponent = (): JSX.Element => {
    return (
      <div className={isStaticSiteCreate ? gridContextPaneContainerStyle : gridContainerStyle}>
        {getHeaderRow()}
        {getPriceRow()}
        {getIncludedBandwidthRow()}
        {getCustomDomainsRow()}
        {getSslCertificatesRow()}
        {getCustomAuthenticationRow()}
        {getAppSizeRow()}
        {getStagingEnvironmentsRow()}
        {getAzureFunctionsRow()}
      </div>
    );
  };

  const getSelectOrSaveButton = (): JSX.Element => {
    return isStaticSiteCreate ? (
      <PrimaryButton text={t('select')} className={buttonPadding} ariaLabel={t('select')} onClick={selectButtonOnClick} />
    ) : (
      <PrimaryButton
        text={t('save')}
        className={buttonPadding}
        ariaLabel={t('save')}
        onClick={saveButtonOnClick}
        disabled={isSaveButtonDisabled()}
      />
    );
  };

  const getCancelButton = (): JSX.Element => {
    return <DefaultButton text={t('cancel')} className={buttonPadding} ariaLabel={t('cancel')} onClick={cancelButtonOnClick} />;
  };

  const cancelButtonOnClick = () => {
    if (isStaticSiteCreate) {
      portalContext.closeSelf();
    } else {
      setSelectedSku(currentSku);
    }
  };

  const getFooter = (): JSX.Element => {
    return (
      <div className={buttonFooterStyle(theme)}>
        {getSelectOrSaveButton()}
        {getCancelButton()}
      </div>
    );
  };

  useEffect(() => {
    if (currentSku) {
      setSelectedSku(currentSku);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isStaticSiteCreate ? (
        <h2 className={titleWithPaddingStyle}>{t('staticSitePlanComparison')}</h2>
      ) : (
        <h3 className={smallerTitleWithPaddingStyle}>{t('staticSiteChoosePlan')}</h3>
      )}

      <div className={descriptionStyle} id="hosting-plan-desc">
        {t('staticSiteHostingPlanDescription')}
      </div>

      {getGridComponent()}
      {getFooter()}
    </>
  );
};

export default StaticSiteSkuPicker;

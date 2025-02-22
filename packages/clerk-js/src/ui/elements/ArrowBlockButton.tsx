import React, { isValidElement } from 'react';

import type { Button, LocalizationKey } from '../customizables';
import { Flex, Icon, SimpleButton, Spinner, Text } from '../customizables';
import type { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import { ArrowRightIcon } from '../icons';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';

type ArrowBlockButtonProps = PropsOfComponent<typeof Button> & {
  rightIcon?: React.ComponentType;
  rightIconSx?: ThemableCssProp;
  leftIcon?: React.ComponentType | React.ReactElement;
  leftIconSx?: ThemableCssProp;
  childrenSx?: ThemableCssProp;
  leftIconElementDescriptor?: ElementDescriptor;
  leftIconElementId?: ElementId;
  badge?: React.ReactElement;
  textElementDescriptor?: ElementDescriptor;
  textElementId?: ElementId;
  arrowElementDescriptor?: ElementDescriptor;
  arrowElementId?: ElementId;
  spinnerElementDescriptor?: ElementDescriptor;
  spinnerElementId?: ElementId;
  textLocalizationKey?: LocalizationKey | string;
};

export const ArrowBlockButton = (props: ArrowBlockButtonProps) => {
  const {
    rightIcon = ArrowRightIcon,
    rightIconSx,
    leftIcon,
    leftIconSx,
    leftIconElementId,
    leftIconElementDescriptor,
    isLoading,
    children,
    textElementDescriptor,
    textElementId,
    spinnerElementDescriptor,
    spinnerElementId,
    arrowElementDescriptor,
    arrowElementId,
    textLocalizationKey,
    childrenSx,
    badge,
    ...rest
  } = props;

  const isIconElement = isValidElement(leftIcon);

  return (
    <SimpleButton
      variant='secondary'
      block
      isLoading={isLoading}
      {...rest}
      sx={theme => [
        {
          gap: theme.space.$4,
          position: 'relative',
          justifyContent: 'center',
          borderColor: theme.colors.$blackAlpha200,
          alignItems: 'center',
          '--arrow-opacity': '0',
          '--arrow-transform': `translateX(-${theme.space.$2});`,
          '&:hover,&:focus ': {
            '--arrow-opacity': '0.5',
            '--arrow-transform': 'translateX(0px);',
          },
        },
        props.sx,
      ]}
    >
      {(isLoading || leftIcon) && (
        <Flex
          as='span'
          sx={theme => ({ flex: `0 0 ${theme.space.$5}` })}
        >
          {isLoading ? (
            <Spinner
              elementDescriptor={spinnerElementDescriptor}
              elementId={spinnerElementId}
              size={'md'}
            />
          ) : !isIconElement && leftIcon ? (
            <Icon
              elementDescriptor={leftIconElementDescriptor}
              elementId={leftIconElementId}
              icon={leftIcon as React.ComponentType}
              sx={[
                theme => ({
                  color: theme.colors.$blackAlpha600,
                  width: theme.sizes.$5,
                }),
                leftIconSx,
              ]}
            />
          ) : (
            leftIcon
          )}
        </Flex>
      )}
      <Flex
        gap={2}
        sx={[
          {
            overflow: 'hidden',
          },
          childrenSx,
        ]}
      >
        <Text
          elementDescriptor={textElementDescriptor}
          elementId={textElementId}
          as='span'
          truncate
          variant='buttonSmall'
          localizationKey={textLocalizationKey}
        >
          {children}
        </Text>
        {badge}
      </Flex>
      <Icon
        elementDescriptor={arrowElementDescriptor}
        elementId={arrowElementId}
        icon={rightIcon}
        sx={[
          theme => ({
            transition: 'all 100ms ease',
            minWidth: theme.sizes.$4,
            minHeight: theme.sizes.$4,
            width: '1em',
            height: '1em',
            opacity: `var(--arrow-opacity)`,
            transform: `var(--arrow-transform)`,
          }),
          rightIconSx,
        ]}
      />
    </SimpleButton>
  );
};

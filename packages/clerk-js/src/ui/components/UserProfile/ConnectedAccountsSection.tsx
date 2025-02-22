import { useUser } from '@clerk/shared/react';
import type { ExternalAccountResource, OAuthProvider, OAuthScope, OAuthStrategy } from '@clerk/types';

import { appendModalState } from '../../../utils';
import { useUserProfileContext } from '../../contexts';
import { Badge, descriptors, Flex, Image, localizationKeys, Text } from '../../customizables';
import { ProfileSection, ThreeDotsMenu, useCardState } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useEnabledThirdPartyProviders } from '../../hooks';
import { useRouter } from '../../router';
import type { PropsOfComponent } from '../../styledSystem';
import { handleError } from '../../utils';
import { ConnectedAccountsForm } from './ConnectedAccountsForm';
import { RemoveConnectedAccountForm } from './RemoveResourceForm';

type RemoveConnectedAccountScreenProps = { accountId: string };
const RemoveConnectedAccountScreen = (props: RemoveConnectedAccountScreenProps) => {
  const { close } = useActionContext();
  return (
    <RemoveConnectedAccountForm
      onSuccess={close}
      onReset={close}
      {...props}
    />
  );
};

type ConnectedAccountsScreenProps = { accountId?: string };
const ConnectedAccountsScreen = (props: ConnectedAccountsScreenProps) => {
  const { close } = useActionContext();
  return (
    <ConnectedAccountsForm
      onSuccess={close}
      onReset={close}
      {...props}
    />
  );
};

export const ConnectedAccountsSection = () => {
  const { user } = useUser();
  const { providerToDisplayData } = useEnabledThirdPartyProviders();
  const { additionalOAuthScopes } = useUserProfileContext();

  if (!user) {
    return null;
  }

  const accounts = [
    ...user.verifiedExternalAccounts,
    ...user.unverifiedExternalAccounts.filter(a => a.verification?.error),
  ];

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.connectedAccountsSection.title')}
      id='connectedAccounts'
    >
      <Action.Root>
        <ProfileSection.ItemList id='connectedAccounts'>
          {accounts.map(account => {
            const label = account.username || account.emailAddress;
            const error = account.verification?.error?.longMessage;
            const additionalScopes = findAdditionalScopes(account, additionalOAuthScopes);
            const reauthorizationRequired = additionalScopes.length > 0 && account.approvedScopes != '';

            return (
              <Action.Root key={account.id}>
                <Action.Closed value=''>
                  <ProfileSection.Item id='connectedAccounts'>
                    <Flex sx={t => ({ alignItems: 'center', gap: t.space.$2, width: '100%' })}>
                      <Image
                        elementDescriptor={[descriptors.providerIcon]}
                        elementId={descriptors.socialButtonsProviderIcon.setId(account.provider)}
                        alt={providerToDisplayData[account.provider].name}
                        src={providerToDisplayData[account.provider].iconUrl}
                        sx={theme => ({ width: theme.sizes.$4 })}
                      />
                      <Text sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        <Flex
                          gap={2}
                          center
                        >
                          {`${providerToDisplayData[account.provider].name}`}
                          <Text
                            as='span'
                            sx={t => ({ color: t.colors.$blackAlpha400 })}
                          >
                            {label ? `• ${label}` : ''}
                          </Text>
                          {(error || reauthorizationRequired) && (
                            <Badge
                              colorScheme='danger'
                              localizationKey={localizationKeys('badge__requiresAction')}
                            />
                          )}
                        </Flex>
                      </Text>
                    </Flex>

                    <ConnectedAccountMenu account={account} />
                  </ProfileSection.Item>
                </Action.Closed>

                <Action.Open value='remove'>
                  <Action.Card>
                    <RemoveConnectedAccountScreen accountId={account.id} />
                  </Action.Card>
                </Action.Open>
              </Action.Root>
            );
          })}

          <Action.Trigger value='add'>
            <ProfileSection.Button
              id='connectedAccounts'
              localizationKey={localizationKeys('userProfile.start.connectedAccountsSection.primaryButton')}
            />
          </Action.Trigger>
        </ProfileSection.ItemList>

        <Action.Open value='add'>
          <Action.Card>
            <ConnectedAccountsScreen />
          </Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection.Root>
  );
};

const ConnectedAccountMenu = ({ account }: { account: ExternalAccountResource }) => {
  const card = useCardState();
  const { user } = useUser();
  const { navigate } = useRouter();
  const { open } = useActionContext();
  const error = account.verification?.error?.longMessage;
  const { additionalOAuthScopes, componentName, mode } = useUserProfileContext();
  const isModal = mode === 'modal';
  const additionalScopes = findAdditionalScopes(account, additionalOAuthScopes);
  const reauthorizationRequired = additionalScopes.length > 0 && account.approvedScopes != '';
  const actionLabel = !reauthorizationRequired
    ? localizationKeys('userProfile.start.connectedAccountsSection.actionLabel__connectionFailed')
    : localizationKeys('userProfile.start.connectedAccountsSection.actionLabel__reauthorize');

  const handleOnClick = async () => {
    const redirectUrl = isModal ? appendModalState({ url: window.location.href, componentName }) : window.location.href;

    try {
      let response: ExternalAccountResource;
      if (reauthorizationRequired) {
        response = await account.reauthorize({ additionalScopes, redirectUrl });
      } else {
        if (!user) {
          throw Error('user is not defined');
        }

        response = await user.createExternalAccount({
          strategy: account.verification!.strategy as OAuthStrategy,
          redirectUrl,
          additionalScopes,
        });
      }

      await navigate(response.verification!.externalVerificationRedirectURL?.href || '');
    } catch (err) {
      handleError(err, [], card.setError);
    }
  };

  const actions = (
    [
      error || reauthorizationRequired
        ? {
            label: actionLabel,
            onClick: handleOnClick,
          }
        : null,
      {
        label: localizationKeys('userProfile.start.connectedAccountsSection.destructiveActionTitle'),
        isDestructive: true,
        onClick: () => open('remove'),
      },
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(a => a !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};

function findAdditionalScopes(
  account: ExternalAccountResource,
  scopes?: Partial<Record<OAuthProvider, OAuthScope[]>>,
): string[] {
  if (!scopes) {
    return [];
  }

  const additionalScopes = scopes[account.provider] || [];
  const currentScopes = account.approvedScopes.split(' ');
  const missingScopes = additionalScopes.filter(scope => !currentScopes.includes(scope));
  if (missingScopes.length === 0) {
    return [];
  }

  return additionalScopes;
}

import { useUser } from '@clerk/shared/react';

import { Flex, Image, localizationKeys } from '../../customizables';
import { ProfileSection, ThreeDotsMenu } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useEnabledThirdPartyProviders } from '../../hooks';
import type { PropsOfComponent } from '../../styledSystem';
import { RemoveWeb3WalletForm } from './RemoveResourceForm';
import { AddWeb3Wallet } from './Web3Form';

type RemoveWeb3WalletScreenProps = { walletId: string };
const RemoveWeb3WalletScreen = (props: RemoveWeb3WalletScreenProps) => {
  const { close } = useActionContext();
  return (
    <RemoveWeb3WalletForm
      onSuccess={close}
      onReset={close}
      {...props}
    />
  );
};

type Web3WalletScreenProps = { walletId?: string };
const Web3WalletScreen = (props: Web3WalletScreenProps) => {
  const { close } = useActionContext();
  return (
    <AddWeb3Wallet
      onSuccess={close}
      onReset={close}
      {...props}
    />
  );
};

export const Web3Section = () => {
  const { user } = useUser();
  const { strategyToDisplayData } = useEnabledThirdPartyProviders();

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.web3WalletsSection.title')}
      id='web3Wallets'
    >
      <Action.Root>
        <ProfileSection.ItemList id='web3Wallets'>
          {user?.web3Wallets.map(wallet => {
            const strategy = wallet.verification.strategy as keyof typeof strategyToDisplayData;

            return (
              <Action.Root key={wallet.id}>
                <Action.Closed value=''>
                  <ProfileSection.Item
                    key={wallet.id}
                    id='web3Wallets'
                  >
                    <Flex
                      align='center'
                      gap={2}
                    >
                      <Image
                        src={strategyToDisplayData[strategy].iconUrl}
                        alt={strategyToDisplayData[strategy].name}
                        sx={theme => ({ width: theme.sizes.$4 })}
                      />
                      {strategyToDisplayData[strategy].name} ({wallet.web3Wallet})
                    </Flex>

                    <Web3WalletMenu />
                  </ProfileSection.Item>
                </Action.Closed>

                <Action.Open value='remove'>
                  <Action.Card>
                    <RemoveWeb3WalletScreen walletId={wallet.id} />
                  </Action.Card>
                </Action.Open>
              </Action.Root>
            );
          })}

          <Action.Trigger value='add'>
            <ProfileSection.Button
              id='web3Wallets'
              localizationKey={localizationKeys('userProfile.start.web3WalletsSection.primaryButton')}
            />
          </Action.Trigger>
        </ProfileSection.ItemList>

        <Action.Open value='add'>
          <Action.Card>
            <Web3WalletScreen />
          </Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection.Root>
  );
};

const Web3WalletMenu = () => {
  const actions = (
    [
      {
        label: localizationKeys('userProfile.start.web3WalletsSection.destructiveAction'),
        onClick: () => open('verify'),
      },
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(a => a !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};

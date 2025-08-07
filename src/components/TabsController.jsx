import { AgreementsList, NewAgreement, BackupTab } from '.';

import { Tabs, Tab, Card, CardBody } from '@heroui/react';

function TabsController() {
    return (
        <div className="flex w-full flex-col items-center justify-center">
            <Tabs aria-label="Options" variant="underlined">
                <Tab key="allAgreements" title="Все договора">
                    <AgreementsList />
                </Tab>
                <Tab key="newAgreement" title="Новый договор">
                    <Card>
                        <CardBody>
                            <NewAgreement />
                        </CardBody>
                    </Card>
                </Tab>
                <Tab key="backup" title="Резервное копирование/восстановление">
                    <Card>
                        <CardBody>
                            <BackupTab />
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>
        </div>
    );
}

export default TabsController
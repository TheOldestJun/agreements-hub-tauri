import { useState } from 'react';
import cuid from 'cuid';

import { Form, Button, Input, DatePicker, addToast, Checkbox } from '@heroui/react';
import { I18nProvider } from '@react-aria/i18n';
import db from '../assets/db';

function NewAgreement() {
    const [errors, setErrors] = useState({});
    const [autoRenew, setAutoRenew] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        if (data.egrpou.length !== 8) {
            setErrors({ egrpou: 'ЕГРПОУ должен состоять из 8 цифр' });
            return;
        }
        if (autoRenew) data.autoRenew = true;
        else data.autoRenew = false;
        data.dateReg = new Date(data.dateReg).toISOString();
        if (autoRenew) data.dateExp = null;
        else data.dateExp = new Date(data.dateExp).toISOString();
        try {
            const id = await db.agreements.add({ id: cuid(), ...data });
            if (id) {
                addToast({
                    title: 'Новый договор',
                    description: `Добавлен новый договор`,
                    color: 'success',
                });
            }
        } catch (error) {
            addToast({
                title: 'Новый договор',
                description: `Ошибка добавления: ${error.message}`,
                color: 'danger',
            })
        }
    };

    return (
        <>
            <Form
                className="grid w-full grid-cols-4 gap-4"
                validationErrors={errors}
                onSubmit={onSubmit}
            >
                <Input
                    label="№ п.п."
                    labelPlacement="outside"
                    name="no"
                    radius="sm"
                    type="number"
                    min={1}
                    isRequired
                    className="col-span-1"
                />
                <Input
                    label="№ договора"
                    labelPlacement="outside"
                    name="regNumber"
                    radius="sm"
                    type="text"
                    isRequired
                    className="col-span-1"
                />
                <Input
                    label="Контрагент"
                    labelPlacement="outside"
                    name="contrAgent"
                    radius="sm"
                    type="text"
                    isRequired
                    className="col-span-2"
                />
                <Input
                    label="ЕГРПОУ"
                    labelPlacement="outside"
                    name="egrpou"
                    radius="sm"
                    type="text"
                    isRequired
                />
                <Input
                    label="Предмет договора"
                    labelPlacement="outside"
                    name="subject"
                    radius="sm"
                    type="text"
                    className="col-span-3"
                />
                <Input
                    label="Дополнительные соглашения"
                    labelPlacement="outside"
                    name="addOns"
                    radius="sm"
                    type="text"
                    className="col-span-2"
                />
                <Input
                    label="Ответственное лицо"
                    labelPlacement="outside"
                    name="responsible"
                    radius="sm"
                    type="text"
                    className="col-span-2"
                />
                <Input
                    label="Примечания"
                    labelPlacement="outside"
                    name="annotations"
                    radius="sm"
                    type="text"
                    className="col-span-4"
                />
                <Checkbox
                    name="autoRenew"
                    isSelected={autoRenew}
                    onValueChange={setAutoRenew}
                    value={autoRenew}
                    className="col-span-4"
                >
                    Автоматическое продление
                </Checkbox>
                <I18nProvider locale="ru-RU">
                    <DatePicker
                        isRequired
                        className="col-span-2"
                        label="Дата регистрации"
                        name="dateReg"
                        firstDayOfWeek="mon"
                    />
                    <DatePicker
                        isRequired
                        className="col-span-2"
                        label="Дата окончания"
                        name="dateExp"
                        firstDayOfWeek="mon"
                        isDisabled={autoRenew}
                    />
                </I18nProvider>

                <Button type="submit" variant="flat" className="col-span-4">
                    Сохранить договор
                </Button>
            </Form>
        </>
    )
}

export default NewAgreement
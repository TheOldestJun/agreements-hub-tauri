import { useState, useEffect } from 'react';
import { add } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Divider,
    Button,
    useDisclosure,
    Form,
    Input,
    Image,
    DatePicker,
    addToast,
    Checkbox
} from '@heroui/react';
import { parseDate } from "@internationalized/date";
import { I18nProvider } from '@react-aria/i18n';
import db from '../assets/db';
import editIcon from '../assets/edit.png';

function EditModal({ id }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [errors, setErrors] = useState({});
    const [autoRenew, setAutoRenew] = useState(false);
    const agreement = useLiveQuery(() => db.agreements.get(id), [id]);

    useEffect(() => {
        if (agreement) {
            setAutoRenew(agreement.autoRenew);
        }
    }, [agreement]);

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
            await db.agreements.update(id, { id, ...data });
            onOpenChange(false);
            addToast({
                title: 'Договор',
                description: `Договор ${data.no} был отредактирован!`,
                color: 'success',
            });
        } catch (error) {
            addToast({
                title: 'Договор',
                description: `Ошибка редактирования: ${error.message}`,
                color: 'danger',
            })
        }
    };
    return (
        <>
            <Image src={editIcon} alt="edit" width={40} onClick={onOpen} />
            <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange} backdrop={'blur'} size='3xl'>
                <ModalContent>
                    {(onClose) => (
                        <>

                            <ModalHeader className="flex flex-col gap-1 text-center">Редактировать договор</ModalHeader>

                            <ModalBody>
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
                                        defaultValue={agreement.no}
                                    />
                                    <Input
                                        label="№ договора"
                                        labelPlacement="outside"
                                        name="regNumber"
                                        radius="sm"
                                        type="text"
                                        isRequired
                                        className="col-span-1"
                                        defaultValue={agreement.regNumber}
                                    />
                                    <Input
                                        label="Контрагент"
                                        labelPlacement="outside"
                                        name="contrAgent"
                                        radius="sm"
                                        type="text"
                                        isRequired
                                        className="col-span-2"
                                        defaultValue={agreement.contrAgent}
                                    />
                                    <Input
                                        label="ЕГРПОУ"
                                        labelPlacement="outside"
                                        name="egrpou"
                                        radius="sm"
                                        type="text"
                                        isRequired
                                        defaultValue={agreement.egrpou}
                                    />
                                    <Input
                                        label="Предмет договора"
                                        labelPlacement="outside"
                                        name="subject"
                                        radius="sm"
                                        type="text"
                                        className="col-span-3"
                                        defaultValue={agreement.subject}
                                    />
                                    <Input
                                        label="Дополнительные соглашения"
                                        labelPlacement="outside"
                                        name="addOns"
                                        radius="sm"
                                        type="text"
                                        className="col-span-2"
                                        defaultValue={agreement.addOns}
                                    />
                                    <Input
                                        label="Ответственное лицо"
                                        labelPlacement="outside"
                                        name="responsible"
                                        radius="sm"
                                        type="text"
                                        className="col-span-2"
                                        defaultValue={agreement.responsible}
                                    />
                                    <Input
                                        label="Примечания"
                                        labelPlacement="outside"
                                        name="annotations"
                                        radius="sm"
                                        type="text"
                                        className="col-span-4"
                                        defaultValue={agreement.annotations}
                                    />
                                    <Checkbox
                                        name="autoRenew"
                                        isSelected={autoRenew}
                                        onValueChange={setAutoRenew}
                                        className="col-span-4"
                                        value={autoRenew}
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
                                            defaultValue={parseDate(agreement.dateReg.substring(0, 10))}
                                        />
                                        <DatePicker
                                            isRequired
                                            className="col-span-2"
                                            label="Дата окончания"
                                            name="dateExp"
                                            firstDayOfWeek="mon"
                                            defaultValue={agreement.autoRenew ? parseDate("2099-12-31") : parseDate(agreement.dateExp.substring(0, 10))}
                                            isDisabled={autoRenew}
                                        />
                                    </I18nProvider>
                                    <Divider className='col-span-4' />
                                    <Button color="primary" type='submit' className='col-span-2 mb-2'>
                                        Сохранить изменения
                                    </Button>
                                    <Button color="danger" variant="flat" onPress={onClose} className='col-span-2 mb-2'>
                                        Закрыть
                                    </Button>
                                </Form>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default EditModal
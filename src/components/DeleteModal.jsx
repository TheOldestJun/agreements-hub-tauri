import { add } from 'date-fns';

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalFooter,
    Button,
    useDisclosure,
    Image,
    addToast
} from '@heroui/react';
import db from '../assets/db';
import deleteIcon from '../assets/remove.png';

function DeleteModal({ id }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const onDelete = async () => {
        try {
            await db.agreements.delete(id);
            onOpenChange(false);
            addToast({
                title: 'Договор',
                description: `Договор был удален!`,
                color: 'success',
            });
        } catch (error) {
            addToast({
                title: 'Договор',
                description: `Ошибка удаления: ${error.message}`,
                color: 'danger',
            })
        }
    };

    return (
        <>
            <Image src={deleteIcon} alt="delete" width={40} onClick={onOpen} />
            <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange} backdrop={'blur'}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-center">Подтверждаете удаление?</ModalHeader>
                            <ModalFooter>
                                <Button color="danger" variant="flat" onPress={onDelete}>
                                    Да, удалить
                                </Button>
                                <Button color="primary" onPress={onClose}>
                                    Нет, закрыть
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>

    )
}

export default DeleteModal
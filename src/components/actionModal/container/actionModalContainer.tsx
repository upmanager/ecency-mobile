import React, { useEffect, useRef, useState } from 'react';
import {AlertButton, ButtonProps } from 'react-native';
import { Source } from 'react-native-fast-image';
import { useSelector, useDispatch } from 'react-redux';
import { ActionModalView } from '..';
import { hideActionModal } from '../../../redux/actions/uiAction';
import { ActionModalRef } from '../view/actionModalView';

export interface ActionModalData {
  title:string, 
  body:string, 
  buttons:AlertButton[], 
  headerImage?:Source,
  onClosed:()=>void,
}


const ActionModalContainer = ({ navigation }) => {
  const dispatch = useDispatch();
  const actionModalRef = useRef<ActionModalRef>();

  const actionModalVisible = useSelector((state) => state.ui.actionModalVisible);
  const actionModalData:ActionModalData = useSelector(state => state.ui.actionModalData)
  
  const [modalToken, setModalToken] = useState(0);

  useEffect(() => {
    if (actionModalVisible && actionModalVisible !== modalToken) {
        actionModalRef.current?.showModal();
        setModalToken(actionModalVisible);
    }
  }, [actionModalVisible]);


  const _onClose = () => {
    if(actionModalData.onClosed){
      actionModalData.onClosed();
    }
    dispatch(hideActionModal());
  };


  return (
    <ActionModalView
      ref={actionModalRef}
      onClose={_onClose}
      data={actionModalData}
    />
  );
};

export default ActionModalContainer;
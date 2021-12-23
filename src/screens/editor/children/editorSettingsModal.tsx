import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';

import { DateTimePicker, MainButton, Modal, SettingsItem } from '../../../components';
import styles from './editorSettingsModalStyles';
import ThumbSelectionContent from './thumbSelectionContent';
import {View as AnimatedView} from 'react-native-animatable';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import BeneficiarySelectionContent from './beneficiarySelectionContent';
import EStyleSheet from 'react-native-extended-stylesheet';

const REWARD_TYPES = [
  {
    key:'default',
    intlId:'editor.reward_default'
  },
  {
    key:'sp',
    intlId:'editor.reward_power_up'
  },
  {
    key:'dp',
    intlId:'editor.reward_decline'
  },
]



export interface EditorSettingsModalRef {
    showModal:()=>void;
}


interface EditorSettingsModalProps {
  body:string;
  draftId:string;
  thumbIndex:number,
  isEdit:boolean;
  isCommunityPost:boolean;
  handleRewardChange:(rewardType:string)=>void;
  handleThumbSelection:(index:number)=>void;
  handleScheduleChange:(datetime:string|null)=>void;
  handleShouldReblogChange:(shouldReblog:boolean)=>void;
}

const EditorSettingsModal =  forwardRef(({
  body,
  draftId,
  thumbIndex,
  isEdit,
  isCommunityPost,
  handleRewardChange,
  handleThumbSelection,
  handleScheduleChange,
  handleShouldReblogChange,
}: EditorSettingsModalProps, ref) => {
    const intl = useIntl();

    const [showModal, setShowModal] = useState(false);
    const [rewardTypeIndex, setRewardTypeIndex] = useState(0);
    const [scheduleLater, setScheduleLater] = useState(false)
    const [shouldReblog, setShouldReblog] = useState(false);
    const [scheduledFor, setScheduledFor] = useState('');
    const [disableDone, setDisableDone] = useState(false);

    // removed the useeffect causing index reset bug


    useEffect(()=>{
      if(!scheduleLater){
        handleScheduleChange(null)
      }else if(scheduledFor) {
        handleScheduleChange(scheduledFor)
      }
    }, [scheduleLater, scheduledFor])

    useEffect(() => {
      handleShouldReblogChange(shouldReblog)
    }, [shouldReblog])

    useEffect(() => {
      if(!isCommunityPost && shouldReblog){
        setShouldReblog(false);
      }
    }, [isCommunityPost])
  

    useImperativeHandle(ref, () => ({
        show: () => {
          setShowModal(true);
        },
      }));


    const _handleRewardChange = (index:number) => {
      setRewardTypeIndex(index)
      const rewardTypeKey = REWARD_TYPES[index].key
      if (handleRewardChange) {
        handleRewardChange(rewardTypeKey);
      }
    } 

    const _handleDatePickerChange = (date:string) => {
      setScheduledFor(date);
    }

    const _onDonePress = () => {
      setShowModal(false);
    }
 
    // handle index change here instead of useeffetc
    const _handleThumbIndexSelection = (index:number) => {
      handleThumbSelection(index)
    }

    const _renderContent = (
      <View style={{flex:1}}>
          <KeyboardAwareScrollView contentContainerStyle={{flex:1}} >
          <View style={styles.container}>
            {!isEdit && (
              <>
                <SettingsItem
                  title={intl.formatMessage({id:'editor.scheduled_for'}) }
                  type="dropdown"
                  actionType="reward"
                  options={[
                    intl.formatMessage({id:"editor.scheduled_immediate"}),
                    intl.formatMessage({id:"editor.scheduled_later"}),
                  ]}
                  selectedOptionIndex={scheduleLater ? 1 : 0}
                  handleOnChange={(index)=>{
                  setScheduleLater(index === 1)
                  }}
                />
  
                {scheduleLater && (
                  <AnimatedView animation="flipInX" duration={700}>
                    <DateTimePicker
                      type="datetime"
                      onChanged={_handleDatePickerChange}
                      disabled={true}
                    />
                  </AnimatedView>
                
                )}
  
                <SettingsItem
                  title={intl.formatMessage({
                    id: 'editor.setting_reward',
                  })}
                  type="dropdown"
                  actionType="reward"
                  options={
                    REWARD_TYPES.map((type)=>intl.formatMessage({ id: type.intlId}))
                  }
                  selectedOptionIndex={rewardTypeIndex}
                  handleOnChange={_handleRewardChange}
                />
  
  
                {isCommunityPost && (
                  <SettingsItem
                    title={intl.formatMessage({
                      id: 'editor.setting_reblog',
                    })}
                    type="toggle"
                    actionType="reblog"
                    isOn={shouldReblog}
                    handleOnChange={setShouldReblog}
                  />
                )}
                </>
            )}
              
  
            <ThumbSelectionContent 
              body={body}
              thumbIndex={thumbIndex}
              onThumbSelection={_handleThumbIndexSelection}
            />
  
            {!isEdit && (
                <BeneficiarySelectionContent
                  draftId={draftId}
                  setDisableDone={setDisableDone}
                />
            )}
            
            
          </View>
        </KeyboardAwareScrollView>

        <MainButton
          style={{...styles.saveButton, backgroundColor:EStyleSheet.value(disableDone?'$primaryDarkGray':'$primaryBlue') }}
          isDisable={disableDone}
          onPress={_onDonePress}
          text={intl.formatMessage({id:"editor.done"})}
          />
      </View>
   
        
    )


  return (
    <Modal 
        isOpen={showModal}
        handleOnModalClose={() => setShowModal(false)}
        isFullScreen
        isCloseButton
        presentationStyle="formSheet"
        title={intl.formatMessage({id:"editor.settings_title"})}
        animationType="slide"
        style={styles.modalStyle}
      >
      {_renderContent}
    </Modal>
     
  );
});

export default EditorSettingsModal

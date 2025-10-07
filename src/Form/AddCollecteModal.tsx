import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, DatePicker, Button, Row, Col, ConfigProvider, Spin } from 'antd';
import { AddCollecteModalProps, CollectResult } from '../Modules/types';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import frFR from 'antd/lib/locale/fr_FR';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import SearchServices from '../Services/Search.services';

dayjs.locale('fr');
dayjs.extend(weekOfYear);

const { Option } = Select;
const { MonthPicker } = DatePicker;

const categorieOptions = [
  { label: 'Déchets Ménagers', value: 'Ménagers', maxCount: 3 },
  { label: 'Recyclés', value: 'Recyclés', maxCount: 1 },
  { label: 'Organiques', value: 'Organiques', maxCount: 2 },
  { label: 'Verres', value: 'Verres', maxCount: 1 },
];

const frequenceOptions = [
  { label: 'Journalier', value: 'journalier' },
  { label: 'Hebdomadaire (chaque semaine)', value: 'hebdomadaire' },
  { label: 'Hebdomadaire impaire (semaines impaires)', value: 'hebdomadaire impaire' },
  { label: 'Hebdomadaire paire (semaines paires)', value: 'hebdomadaire paire' },
  { label: 'Mensuel (ex: 3ème lundi du mois)', value: 'mensuel' },
  { label: 'Apport volontaire', value: 'apport volontaire' },
];

const jourOptions = [
  { label: 'Lundi', value: 'lundi' },
  { label: 'Mardi', value: 'mardi' },
  { label: 'Mercredi', value: 'mercredi' },
  { label: 'Jeudi', value: 'jeudi' },
  { label: 'Vendredi', value: 'vendredi' },
  { label: 'Samedi', value: 'samedi' },
  { label: 'Dimanche', value: 'dimanche' },
];

const occurrenceOptions = [
  { label: '1er', value: '1' },
  { label: '2ème', value: '2' },
  { label: '3ème', value: '3' },
  { label: '4ème', value: '4' },
  { label: 'Dernier', value: 'last' },
];

const AddCollecteModal: React.FC<AddCollecteModalProps & { collectesExistantes: CollectResult[] }> = ({
  visible,
  onCancel,
  onOk,
  selectedOption,
  collectesExistantes,
  authkeytel,
  isLoading,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFrequence, setSelectedFrequence] = useState<string | null>(null);

  const currentWeek = dayjs().week();
  const isEvenWeek = currentWeek % 2 === 0;

  const handleSubmit = () => {
    form.validateFields()
      .then(async (values) => {
        setIsSubmitting(true);
        try {
          const normalizeCodeRivoli = (code: string) => {
            const parts = code.split("_");
            return parts.length === 3 ? parts[1] : code;
          };

          // ➡️ Concaténation de l'occurrence avec le jour
          const occurrencePrefix = values.occurrence ? `${values.occurrence}_` : '';
          const jourFormatted = occurrencePrefix + values.jour;

          if (selectedOption.codeRivoli && selectedOption.codeInsee) {
            const submitValues: CollectResult = {
              ...values,
              jour: jourFormatted, // Exemple : "3_lundi" ou "last_mardi"
              code_insee: selectedOption.codeInsee,
              code_rivoli: normalizeCodeRivoli(selectedOption.codeRivoli),
              startMonth: values.startMonth ? format(values.startMonth.toDate(), 'yyyy-MM') : undefined,
              endMonth: values.endMonth ? format(values.endMonth.toDate(), 'yyyy-MM') : undefined,
              authkeytel: authkeytel ? authkeytel : null,
            };

            await SearchServices.addCollecte(submitValues);
            onOk();
            form.resetFields();
          }
        } catch (error) {
          console.error('Error adding collect:', error);
        } finally {
          setIsSubmitting(false);
        }
      })
      .catch((info) => {
        console.log('Validation failed:', info);
      });
  };

  useEffect(() => {
    // Si la catégorie sélectionnée est "Organiques", on remet la fréquence à null si elle n'est pas "apport volontaire"
    if (selectedCategory === 'Organiques') {
      setSelectedFrequence(null);
      form.setFieldsValue({ frequence: null });
    }
  }, [selectedCategory]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleFrequenceChange = (value: string) => {
    setSelectedFrequence(value);
  };

  const currentCounts = collectesExistantes.reduce((acc: Record<string, number>, collecte) => {
    acc[collecte.categorie] = (acc[collecte.categorie] || 0) + 1;
    return acc;
  }, {});

  const isCategoryDisabled = (categoryValue: string, maxCount: number) => {
    return (currentCounts[categoryValue] || 0) >= maxCount;
  };

  const shouldDisplayMonthPickers = selectedCategory === 'Organiques' && selectedFrequence !== 'apport volontaire';

  const shouldDisplayJourAndOccurrence =
    selectedFrequence &&
    ['hebdomadaire', 'hebdomadaire impaire', 'hebdomadaire paire', 'mensuel'].includes(selectedFrequence);

  return (
    <ConfigProvider locale={frFR}>
      <Modal
        title={
          <>
            <div>Ajouter une collecte</div>
            <div style={{ fontSize: '13px', color: '#888', marginTop: '6px', marginBottom: '6px' }}>
              <span style={{ color: 'red' }}>*</span> Chaque catégorie de collecte possède une limite maximale. Une fois la limite atteinte, la catégorie concernée sera désactivée.
            </div>
          </>
        }
        open={visible}
        onCancel={onCancel}
        footer={null}
      >
        {/* Affichage de la semaine actuelle */}
        <div
          style={{
            marginBottom: '12px',
            padding: '10px',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#333',
          }}
        >
          Nous sommes actuellement en semaine <strong>{currentWeek}</strong>, qui est une semaine <strong>{isEvenWeek ? 'paire' : 'impaire'}</strong>.
        </div>

        {isLoading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100px',
            }}
          >
            <Spin tip="Chargement en cours..." size="large" />
          </div>
        ) : (
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {/* Catégorie */}
            <Form.Item
              name="categorie"
              label="Catégorie"
              rules={[{ required: true, message: 'Veuillez sélectionner une catégorie' }]}
            >
              <Select placement="topLeft" placeholder="Sélectionnez une catégorie" onChange={handleCategoryChange}>
                {categorieOptions.map((option) => {
                  const used = currentCounts[option.value] || 0;
                  const categoryLabel = (
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>{option.label}</span>
                      <span style={{ color: '#77a682' }}>
                        ({used}/{option.maxCount})
                      </span>
                    </div>
                  );
                  return (
                    <Option
                      key={option.value}
                      value={option.value}
                      disabled={isCategoryDisabled(option.value, option.maxCount)}
                    >
                      {categoryLabel}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            {/* Fréquence */}
            <Form.Item
              name="frequence"
              label="Fréquence"
              rules={[{ required: true, message: 'Veuillez sélectionner une fréquence' }]}
            >
              <Select placement="topLeft" placeholder="Sélectionnez une fréquence" onChange={handleFrequenceChange}>
                {frequenceOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Jour + Occurrence */}
            {shouldDisplayJourAndOccurrence && (
              <>
                <Form.Item
                  name="jour"
                  label="Jour"
                  rules={[{ required: true, message: 'Veuillez sélectionner un jour' }]}
                >
                  <Select placement="topLeft" placeholder="Sélectionnez un jour">
                    {jourOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {selectedFrequence === 'mensuel' && (
                  <Form.Item
                    name="occurrence"
                    label="Semaine du mois"
                    rules={[{ required: true, message: "Veuillez sélectionner l'occurrence dans le mois" }]}
                  >
                    <Select placement="topLeft" placeholder="Sélectionnez l'occurrence">
                      {occurrenceOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
              </>
            )}

            {/* Mois de début et de fin */}
            {shouldDisplayMonthPickers && (
              <Form.Item label="Pour la période">
                <div style={{ marginBottom: '8px', color: '#888', fontSize: '12px' }}>
                  Sélectionnez la période de l'année pendant laquelle la collecte a lieu (par exemple : de juin à septembre). L'année n'a pas d'importance, seule la période dans l'année est prise en compte.
                </div>
                <Row gutter={16} align="middle">
                  <Col span={12}>
                    <Form.Item
                      name="startMonth"
                      label="Du"
                      rules={[{ required: true, message: 'Veuillez sélectionner le mois de début' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <MonthPicker
                        placement="topLeft"
                        placeholder="Mois de début"
                        format="YYYY-MM"
                        popupStyle={{ position: 'fixed' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="endMonth"
                      label="Au"
                      rules={[{ required: true, message: 'Veuillez sélectionner le mois de fin' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <MonthPicker
                        placement="topLeft"
                        placeholder="Mois de fin"
                        format="YYYY-MM"
                        popupStyle={{ position: 'fixed' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            )}

            {/* Submit */}
            <Form.Item style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: '50%' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spin size="small" /> : 'Ajouter la collecte'}
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </ConfigProvider>
  );
};

export default AddCollecteModal;
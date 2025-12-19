import React from 'react'
import { DashboardLayout } from '@/features/dashboard/layouts'
import {
  Button,
  Card,
  Col,
  Form,
  Heading,
  HeadingTypes,
  Row,
  Spacer,
  Text,
  TextAlign,
  TextInput,
  TextTypes
} from '@/packages/ui'

import styles from './CompanyProfileView.module.scss'

const CompanyProfileView = () => (
  <DashboardLayout>
    <div className={styles.container}>
      <Col className={styles.block}>
        <Card className={styles.companySidebar}>
          <Heading type={HeadingTypes.H3}>Need help?</Heading>

          <Spacer size={8} />
          <Text type={TextTypes.BODY_SMALL} align={TextAlign.CENTER}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt
          </Text>
          <Spacer size={16} />
          <Button uppercase>Chat with us</Button>
        </Card>
      </Col>

      <Col className={styles.block}>
        <Card padding={30}>
          <Heading type={HeadingTypes.H3}>
            Your company is being verified
          </Heading>

          <Spacer size={18} />
          <Text type={TextTypes.BODY_SMALL}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua, dolor
            sit amet, consectetur adipiscing elit, sed do eiusmod tempor, sed do
            eiusmod tempor.
          </Text>
        </Card>
        <Spacer size={24} />
        <Card paddingVertical={25} paddingHorizontal={30}>
          <Form>
            <Row>
              <TextInput
                label="Name of Company"
                placeholder="Name of Company"
              />
              <Spacer size={32} vertical />
              <TextInput
                label="Incorporation State"
                placeholder="Incorporation State"
              />
            </Row>

            <Row>
              <TextInput
                label="EIN Number (Tax ID)"
                placeholder="EIN Number (Tax ID)"
              />
              <Spacer size={32} vertical />
              <TextInput label="Address" placeholder="Address" />
            </Row>

            <Row>
              <TextInput
                label="Apartment, suite, etc."
                placeholder="Apartment, suite, etc."
              />
              <Spacer size={32} vertical />
              <TextInput label="City" placeholder="City" />
            </Row>

            <Row>
              <TextInput label="State" placeholder="State" />
              <Spacer size={32} vertical />
              <TextInput label="Zip Code" placeholder="Zip code" />
            </Row>

            <Row className="tw-w-[50%]">
              <TextInput label="Country" placeholder="Country" />
              <Spacer size={32 / 2} vertical />
            </Row>
          </Form>

          <Spacer size={30} />
          <Row justify="end">
            <Button width="default" uppercase>
              Edit Information
            </Button>
          </Row>
        </Card>
      </Col>
    </div>
  </DashboardLayout>
)

export default CompanyProfileView

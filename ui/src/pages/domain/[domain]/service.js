/*
 * Copyright 2020 Verizon Media
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import Header from '../../../components/header/Header';
import UserDomains from '../../../components/domain/UserDomains';
import API from '../../../api';
import styled from '@emotion/styled';
import Head from 'next/head';

import DomainDetails from '../../../components/header/DomainDetails';
import ServiceList from '../../../components/service/ServiceList';
import RequestUtils from '../../../components/utils/RequestUtils';
import Tabs from '../../../components/header/Tabs';
import Error from '../../_error';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import DomainNameHeader from '../../../components/header/DomainNameHeader';

const AppContainerDiv = styled.div`
    align-items: stretch;
    flex-flow: row nowrap;
    height: 100%;
    display: flex;
    justify-content: flex-start;
`;

const MainContentDiv = styled.div`
    flex: 1 1 calc(100vh - 60px);
    overflow: hidden;
    font: 300 14px HelveticaNeue-Reg, Helvetica, Arial, sans-serif;
`;

const ServicesContainerDiv = styled.div`
    align-items: stretch;
    flex: 1 1;
    height: calc(100vh - 60px);
    overflow: auto;
    display: flex;
    flex-direction: column;
`;

const ServicesContentDiv = styled.div``;

const PageHeaderDiv = styled.div`
    background: linear-gradient(to top, #f2f2f2, #fff);
    padding: 20px 30px 0;
`;

export async function getServerSideProps(context) {
    let api = API(context.req);
    let reload = false;
    let notFound = false;
    let error = null;

    var bServicesParams = {
        category: 'domain',
        attributeName: 'businessService',
        userName: context.req.session.shortId,
    };
    var bServicesParamsAll = {
        category: 'domain',
        attributeName: 'businessService',
    };
    const domains = await Promise.all([
        api.listUserDomains(),
        api.getHeaderDetails(),
        api.getDomain(context.query.domain),
        api.getServices(context.query.domain),
        api.getForm(),
        api.getPendingDomainMembersList(),
        api.getServicePageConfig(),
        api.isAWSTemplateApplied(context.query.domain),
        api.getFeatureFlag(),
        api.getMeta(bServicesParams),
        api.getMeta(bServicesParamsAll),
        api.getPendingDomainMembersCountByDomain(context.query.domain),
    ]).catch((err) => {
        let response = RequestUtils.errorCheckHelper(err);
        reload = response.reload;
        error = response.error;
        return [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
    });
    let businessServiceOptions = [];
    if (domains[9] && domains[9].validValues) {
        domains[9].validValues.forEach((businessService) => {
            let bServiceOnlyId = businessService.substring(
                0,
                businessService.indexOf(':')
            );
            let bServiceOnlyName = businessService.substring(
                businessService.indexOf(':') + 1
            );
            businessServiceOptions.push({
                value: bServiceOnlyId,
                name: bServiceOnlyName,
            });
        });
    }
    let businessServiceOptionsAll = [];
    if (domains[10] && domains[10].validValues) {
        domains[10].validValues.forEach((businessService) => {
            let bServiceOnlyId = businessService.substring(
                0,
                businessService.indexOf(':')
            );
            let bServiceOnlyName = businessService.substring(
                businessService.indexOf(':') + 1
            );
            businessServiceOptionsAll.push({
                value: bServiceOnlyId,
                name: bServiceOnlyName,
            });
        });
    }
    let domainDetails = domains[2];
    domainDetails.isAWSTemplateApplied = !!domains[7];
    return {
        props: {
            reload,
            notFound,
            error,
            domains: domains[0],
            headerDetails: domains[1],
            domain: context.query.domain,
            domainDetails,
            services: domains[3],
            _csrf: domains[4],
            pending: domains[5],
            pageConfig: domains[6],
            featureFlag: domains[8],
            nonce: context.req.headers.rid,
            validBusinessServices: businessServiceOptions,
            validBusinessServicesAll: businessServiceOptionsAll,
            domainPendingMemberCount: domains[11],
        },
    };
}

export default class ServicePage extends React.Component {
    constructor(props) {
        super(props);
        this.api = API();
        this.cache = createCache({
            key: 'athenz',
            nonce: this.props.nonce,
        });
    }

    render() {
        const { domain, reload, domainDetails, services, _csrf } = this.props;
        if (reload) {
            window.location.reload();
            return <div />;
        }
        if (this.props.error) {
            return <Error err={this.props.error} />;
        }
        return (
            <CacheProvider value={this.cache}>
                <div data-testid='service'>
                    <Head>
                        <title>Athenz</title>
                    </Head>
                    <Header
                        showSearch={true}
                        headerDetails={this.props.headerDetails}
                        pending={this.props.pending}
                    />
                    <MainContentDiv>
                        <AppContainerDiv>
                            <ServicesContainerDiv>
                                <ServicesContentDiv>
                                    <PageHeaderDiv>
                                        <DomainNameHeader
                                            domainName={this.props.domain}
                                            pendingCount={
                                                this.props
                                                    .domainPendingMemberCount
                                            }
                                        />
                                        <DomainDetails
                                            domainDetails={domainDetails}
                                            api={this.api}
                                            _csrf={_csrf}
                                            productMasterLink={
                                                this.props.headerDetails
                                                    .productMasterLink
                                            }
                                            validBusinessServices={
                                                this.props.validBusinessServices
                                            }
                                            validBusinessServicesAll={
                                                this.props
                                                    .validBusinessServicesAll
                                            }
                                        />
                                        <Tabs
                                            api={this.api}
                                            domain={domain}
                                            selectedName={'services'}
                                            featureFlag={this.props.featureFlag}
                                        />
                                    </PageHeaderDiv>
                                    <ServiceList
                                        api={this.api}
                                        domain={domain}
                                        services={services}
                                        _csrf={this.props._csrf}
                                        pageConfig={this.props.pageConfig}
                                        featureFlag={this.props.featureFlag}
                                    />
                                </ServicesContentDiv>
                            </ServicesContainerDiv>
                            <UserDomains
                                domains={this.props.domains}
                                api={this.api}
                                domain={domain}
                            />
                        </AppContainerDiv>
                    </MainContentDiv>
                </div>
            </CacheProvider>
        );
    }
}

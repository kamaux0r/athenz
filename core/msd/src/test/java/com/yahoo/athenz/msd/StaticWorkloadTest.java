/*
 *  Copyright The Athenz Authors
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

package com.yahoo.athenz.msd;

import com.yahoo.rdl.Timestamp;
import org.testng.annotations.Test;

import java.util.Collections;
import java.util.List;

import static org.testng.Assert.*;

public class StaticWorkloadTest {
    @Test
    public void testStaticWorkloadFields() {
        StaticWorkload wl1 = new StaticWorkload();
        List<String> ipAddresses = Collections.singletonList("10.20.30.40");
        wl1.setDomainName("athenz")
                .setServiceName("api")
                .setIpAddresses(ipAddresses)
                .setName("testhost-1")
                .setType(StaticWorkloadType.CLOUD_LB)
                .setUpdateTime(Timestamp.fromMillis(123456789123L));

        assertNotNull(wl1);
        assertEquals(wl1.getDomainName(), "athenz");
        assertEquals(wl1.getServiceName(), "api");
        assertEquals(wl1.getIpAddresses(), ipAddresses);
        assertEquals(wl1.getUpdateTime(), Timestamp.fromMillis(123456789123L));
        assertEquals(wl1.getName(), "testhost-1");
        assertEquals(wl1.getType(), StaticWorkloadType.CLOUD_LB);
        assertEquals(wl1, wl1);

        StaticWorkload wl2 = new StaticWorkload();
        wl2.setDomainName("athenz")
                .setServiceName("api")
                .setIpAddresses(ipAddresses)
                .setName("testhost-1")
                .setType(StaticWorkloadType.CLOUD_LB)
                .setUpdateTime(Timestamp.fromMillis(123456789123L));

        assertEquals(wl1, wl2);

        wl2.setDomainName("sports");
        assertNotEquals(wl1, wl2);
        wl2.setDomainName(null);
        assertNotEquals(wl1, wl2);

        wl2.setDomainName("athenz");
        wl2.setServiceName("apiv2");
        assertNotEquals(wl1, wl2);
        wl2.setServiceName(null);
        assertNotEquals(wl1, wl2);

        wl2.setServiceName("api");
        wl2.setIpAddresses(null);
        assertNotEquals(wl1, wl2);

        wl2.setIpAddresses(ipAddresses);
        wl2.setUpdateTime(Timestamp.fromMillis(123456789456L));
        assertNotEquals(wl1, wl2);
        wl2.setUpdateTime(null);
        assertNotEquals(wl1, wl2);

        wl2.setUpdateTime(Timestamp.fromMillis(123456789123L));
        wl2.setName("random");
        assertNotEquals(wl1, wl2);
        wl2.setName(null);
        assertNotEquals(wl1, wl2);

        wl2.setName("testhost-1");
        wl2.setType(StaticWorkloadType.VIP);
        assertNotEquals(wl1, wl2);
        wl2.setType(null);
        assertNotEquals(wl1, wl2);

        wl2.setType(StaticWorkloadType.CLOUD_LB);
        assertEquals(wl1, wl2);

        assertNotEquals(wl1, null);
        // for code coverage
        assertFalse(wl1.equals("mystring"));
        assertNotEquals(wl1, "mystring");

        assertEquals(wl1, wl1);

    }
}
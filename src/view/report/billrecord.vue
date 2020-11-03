<template>
  <div>
    <Card>
      <dz-table
        :totalCount="stores.billrecord.query.totalCount"
        :pageSize="stores.billrecord.query.pageSize"
        @on-page-change="handlePageChanged"
        @on-page-size-change="handlePageSizeChanged"
      >
        <div slot="searcher">
          <section class="dnc-toolbar-wrap">
            <Row :gutter="16">
              <Col span="16">
                <Form inline @submit.native.prevent>
                  <FormItem>
                    <Input
                      type="text"
                      clearable
                      v-model="stores.billrecord.query.kw"
                      placeholder="输入订单号、客户名、客户电话进行搜索..."
                      @on-search="handleSearchRecordList()"
                    >
                      <span slot="prepend">检索</span>
                    </Input>
                  </FormItem>
                  <FormItem>
                    <DatePicker
                      search
                      :value="dates"
                      v-model="stores.billrecord.query.dates"
                      type="datetimerange"
                      style="width: 200px"
                      format="yyyy-MM-dd"
                      placeholder="请选择日期"
                      clearable
                      @on-ok="handleSearchRecordList()"
                    ></DatePicker>
                  </FormItem>
                  <!-- <FormItem>
                    <Select
                      v-model="stores.billrecord.query.iscancelmanagecost"
                      @on-change="handleSearchRecordList"
                      style="width:80px;"
                    >
                      <Option
                        v-for="item in stores.billrecord.sources.yesorno"
                        :value="item.value"
                        :key="item.value"
                      >{{item.text}}</Option>
                    </Select>
                  </FormItem>-->
                  <FormItem>
                    <Select
                      v-model="stores.billrecord.query.isclosed"
                      @on-change="handleSearchRecordList"
                      style="width: 80px"
                    >
                      <Option
                        v-for="item in stores.billrecord.sources.yesorno"
                        :value="item.value"
                        :key="item.value"
                        >{{ item.text }}</Option
                      >
                    </Select>
                  </FormItem>
                  <FormItem>
                    <Select
                      clearable
                      v-model="stores.billrecord.query.fhospitalid"
                      @on-change="handleSearchRecordList"
                      style="width: 150px"
                    >
                      <Option
                        v-for="item in stores.billrecord.sources.hospiatls"
                        :value="item.id"
                        :key="item.id"
                        >{{ item.name }}</Option
                      >
                    </Select>
                  </FormItem>
                  <FormItem>
                    <Select
                      clearable
                      v-model="stores.billrecord.query.fareaid"
                      @on-change="handleAreaChanged"
                      style="width: 80px"
                    >
                      <Option
                        v-for="item in stores.billrecord.sources.areas"
                        :value="item.id"
                        :key="item.id"
                        >{{ item.name }}</Option
                      >
                    </Select>
                  </FormItem>
                  <FormItem>
                    <Select
                      clearable
                      v-model="stores.billrecord.query.fbedid"
                      @on-change="handleSearchRecordList"
                      style="width: 80px"
                    >
                      <Option
                        v-for="item in stores.billrecord.sources.beds"
                        :value="item.id"
                        :key="item.id"
                        >{{ item.name }}</Option
                      >
                    </Select>
                  </FormItem>
                  <FormItem>
                    <Select
                      clearable
                      v-model="stores.billrecord.query.fmanagerid"
                      @on-change="handleSearchRecordList"
                      style="width: 80px"
                    >
                      <Option
                        v-for="item in stores.billrecord.sources.managers"
                        :value="item.id"
                        :key="item.id"
                        >{{ item.name }}</Option
                      >
                    </Select>
                  </FormItem>
                  <ButtonGroup>
                    <Button
                      size="large"
                      icon="ios-search"
                      :loading="loading"
                      @click="handleSearchRecordList"
                      >查询</Button
                    >
                    <Button
                      size="large"
                      icon="ios-paper-outline"
                      :loading="loading"
                      @click="exportExcel"
                      >导出Execl</Button
                    >
                  </ButtonGroup>
                </Form>
              </Col>
            </Row>
          </section>
        </div>
        <Table
          slot="table"
          ref="tables"
          :border="false"
          size="small"
          :highlight-row="true"
          :data="stores.billrecord.data"
          :columns="stores.billrecord.columns"
          @on-refresh="handleRefresh"
          :row-class-name="rowClsRender"
          @on-page-change="handlePageChanged"
          @on-page-size-change="handlePageSizeChanged"
        ></Table>
      </dz-table>
    </Card>
    <Drawer
      :title="`收据详情-订单号[${curRecord.fOrderBillNo}]`"
      v-model="showDatail"
      width="60%"
      @on-visible-change="showDraw"
      :closable="true"
      :mask-closable="true"
      :mask="true"
      :styles="styles"
    >
      <Card>
        <p slot="title">收据明细</p>
        <Table
          :border="false"
          size="small"
          :highlight-row="true"
          :data="stores.detail.data"
          :columns="stores.detail.columns"
        ></Table>
      </Card>
      <Card style="margin-top: 10px">
        <p slot="title">收据明细-价格变更</p>
        <Table
          :border="false"
          size="small"
          :highlight-row="true"
          :data="stores.detail2.data"
          :columns="stores.detail2.columns"
        ></Table>
      </Card>
      <Card style="margin-top: 10px">
        <p slot="title">收据明细-护工变更</p>
        <Table
          :border="false"
          size="small"
          :highlight-row="true"
          :data="stores.detail3.data"
          :columns="stores.detail3.columns"
        ></Table>
      </Card>
      <Card style="margin-top: 10px">
        <p slot="title">收据明细-客户变更</p>
        <Table
          :border="false"
          size="small"
          :highlight-row="true"
          :data="stores.detail4.data"
          :columns="stores.detail4.columns"
        ></Table>
      </Card>
    </Drawer>
  </div>
</template>

<script>
import DzTable from "_c/tables/dz-table.vue";
import dayjs from "dayjs";
import {
  getBillRecord,
  ExportExcel,
  getBillDetail,
  getBillPriceDetail,
  getBillPersonDetail,
  getBillClientDetail,
  updateBillsStop,
} from "@/api/sys/billrecord";
import { getHospitalSelect } from "@/api/base/hospital";
import { getAreaSelectAll } from "@/api/base/area";
import { getBedSelectAll } from "@/api/base/bed";
import { getManagerSelectAll } from "@/api/base/manager";
import { getCareProjectSelectAll } from "@/api/base/careproject";
import { getCareWaySelectAll } from "@/api/base/careway";
import { getPayWaySelectAll } from "@/api/base/payway";
import { getPcSelectAll } from "@/api/base/pc";
import { getUserSelectAll } from "@/api/rbac/user";
import { b64toFile } from "@/libs/tools";
import { saveAs } from "file-saver";
import expandRow from "./table-expand.vue";
export default {
  name: "bill_record_page",
  components: {
    DzTable,
    expandRow,
  },
  data() {
    var self = this;
    return {
      loading: false,
      showDatail: false,
      styles: {
        height: "calc(100% - 55px)",
        overflow: "auto",
        paddingBottom: "53px",
        position: "static",
      },
      curRecord: {},
      dates: [dayjs().format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")],
      stores: {
        billrecord: {
          query: {
            totalCount: 0,
            pageSize: 20,
            currentPage: 1,
            kw: "",
            fhospitalid: -1,
            fareaid: -1,
            fbedid: -1,
            fmanagerid: -1,
            iscancelmanagecost: -1,
            isclosed: -1,
            sort: [
              {
                direct: "DESC",
                field: "fdate",
              },
            ],
            dates: [],
          },
          columns: [
            // {
            //   type: "expand",
            //   width: 50,
            //   render: (h, { row: { fid } }) => {
            //     return h(expandRow, {
            //       props: {
            //         id: fid + "",
            //         careProjects: f.stores.billrecord.sources.careProjects,
            //         careWays: self.stores.billrecord.sources.careWays,
            //         persons: self.stores.billrecord.sources.persons,
            //         payWays: self.stores.billrecord.sources.payWays,
            //       },
            //     });
            //   },
            // },
            {
              title: "订单号",
              align: "center",
              key: "fOrderBillNo",
              width: 120,
            },
            {
              title: "日期",
              align: "center",
              key: "fDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { fDate },
                } = params;
                var text = dayjs(fDate).format("YYYY-MM-DD HH:mm:ss");

                if (fDate != "" && fDate != null) {
                  return h("span", {}, text);
                }
              },
            },
            {
              title: "开始陪护",
              align: "center",
              key: "fBeginDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { fBeginDate, fBeginPeriod },
                } = params;
                var text = `${dayjs(fBeginDate).format(
                  "YYYY-MM-DD"
                )}(${fBeginPeriod})`;

                if (fBeginDate != "" && fBeginDate != null) {
                  return h("span", {}, text);
                }
              },
            },
            {
              title: "结束陪护",
              align: "center",
              key: "fEndDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { fEndDate, fEndPeriod },
                } = params;
                var text = `${dayjs(fEndDate).format(
                  "YYYY-MM-DD"
                )}(${fEndPeriod})`;

                if (fEndDate != "" && fEndDate != null) {
                  return h("span", {}, text);
                }
              },
            },
            {
              title: "预期天数",
              align: "center",
              key: "fPlanDay",
              width: 80,
            },
            {
              title: "所属医院",
              align: "center",
              key: "fHospitalID",
              width: 120,
              render: (h, params) => {
                const {
                  row: { fHospitalID },
                } = params;
                var tmp = self.stores.billrecord.sources.hospiatls.find(
                  (f) => f.id == fHospitalID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "病区",
              align: "center",
              key: "fAreaID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fAreaID },
                } = params;
                var tmp = self.stores.billrecord.sources.areas.find(
                  (f) => f.id == fAreaID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "床号",
              align: "center",
              key: "fBedID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fBedID },
                } = params;
                var tmp = self.stores.billrecord.sources.beds.find(
                  (f) => f.id == fBedID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "管理老师",
              align: "center",
              key: "fManagerID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fManagerID },
                } = params;
                var tmp = self.stores.billrecord.sources.managers.find(
                  (f) => f.id == fManagerID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "病人姓名",
              align: "center",
              key: "fClient",
              width: 80,
            },
            {
              title: "联系方式",
              align: "center",
              key: "fClientTel",
              width: 100,
            },
            {
              title: "结算总天数",
              align: "center",
              key: "fDay",
              width: 80,
            },
            {
              title: "累计收款",
              align: "center",
              key: "fRecSum",
              width: 80,
            },
            {
              title: "中止?",
              key: "fIsStop",
              align: "center",
              width: 80,
              render: (h, params) => {
                let status = !!params.row.fIsStop;
                let statusColor = "success";
                let statusText = "是";
                switch (status) {
                  case false:
                    statusText = "否";
                    statusColor = "default";
                    break;
                }
                return h(
                  "Tooltip",
                  {
                    props: {
                      placement: "top",
                      transfer: true,
                      delay: 500,
                    },
                  },
                  [
                    //这个中括号表示是Tooltip标签的子标签
                    h(
                      "Tag",
                      {
                        props: {
                          //type: "dot",
                          color: statusColor,
                        },
                      },
                      statusText
                    ), //表格列显示文字
                    h(
                      "p",
                      {
                        slot: "content",
                        style: {
                          whiteSpace: "normal",
                        },
                      },
                      statusText //整个的信息即气泡内文字
                    ),
                  ]
                );
              },
            },
            {
              title: "操作时间",
              align: "center",
              key: "fStopDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { fStopDate },
                } = params;
                var text = `${dayjs(fStopDate).format("YYYY-MM-DD HH:mm:ss")}`;

                if (fStopDate != "" && fStopDate != null) {
                  return h("span", {}, text);
                }
              },
            },
            {
              title: "操作人",
              align: "center",
              key: "fStopBillerID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fStopBillerID },
                } = params;
                var tmp = self.stores.billrecord.sources.users.find(
                  (f) => f.fGuid == fStopBillerID
                );

                if (tmp) {
                  return h("span", {}, tmp.text);
                }
              },
            },
            {
              title: "操作",
              align: "center",
              key: "action",
              width: 180,
              render: (h, { row }) => {
                const self = this;
                const { fIsClosed, fIsStop, fid } = row;
                return h("div", [
                  h(
                    "Button",
                    {
                      props: {
                        size: "small",
                        type: "info",
                        icon: "ios-search",
                      },
                      on: {
                        click: (e) => {
                          self.curRecord = row;
                          self.showDatail = true;
                        },
                      },
                    },
                    "详情"
                  ),
                  h(
                    "Button",
                    {
                      style: {
                        "margin-left": "5px",
                        display: fIsClosed ? "none" : "",
                      },
                      props: {
                        size: "small",
                        type: "warning",
                        icon: "ios-close",
                      },
                      on: {
                        click: (e) => {
                          self.curRecord = row;
                          self.handleUpdate(fid, !!!fIsStop);
                        },
                      },
                    },
                    !!fIsStop ? "恢复" : "中止"
                  ),
                ]);
              },
            },
          ],
          sources: {
            yesorno: [
              { value: -1, text: "全部" },
              { value: 0, text: "未出院结算" },
              { value: 1, text: "已出院结算" },
            ],
            hospiatls: [],
            areas: [],
            beds: [],
            managers: [],
            careProjects: [],
            careWays: [],
            persons: [],
            payWays: [],
            users: [],
          },
          data: [],
        },
        detail: {
          data: [],
          columns: [
            {
              title: "日期",
              align: "center",
              key: "fDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { fDate },
                } = params;
                var text = dayjs(fDate).format("YYYY-MM-DD HH:mm:ss");

                if (fDate != "" && fDate != null) {
                  return h("span", {}, text);
                }
              },
            },
            {
              title: "开始陪护",
              align: "center",
              key: "fBeginDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { fBeginDate, fBeginPeriod },
                } = params;
                var text = `${dayjs(fBeginDate).format(
                  "YYYY-MM-DD"
                )}(${fBeginPeriod})`;

                if (fBeginDate != "" && fBeginDate != null) {
                  return h("span", {}, text);
                }
              },
            },
            {
              title: "结束陪护",
              align: "center",
              key: "fEndDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { fEndDate, fEndPeriod },
                } = params;
                var text = `${dayjs(fEndDate).format(
                  "YYYY-MM-DD"
                )}(${fEndPeriod})`;

                if (fEndDate != "" && fEndDate != null) {
                  return h("span", {}, text);
                }
              },
            },
            {
              title: "护工",
              align: "center",
              key: "fPersonID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fPersonID },
                } = params;
                var tmp = self.stores.billrecord.sources.persons.find(
                  (f) => f.id == fPersonID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "护理种类",
              align: "center",
              key: "fCareTypeID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fCareTypeID },
                } = params;
                var tmp = self.stores.billrecord.sources.careProjects.find(
                  (f) => f.id == fCareTypeID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "护理方式",
              align: "center",
              key: "fCareWayID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fCareWayID },
                } = params;
                var tmp = self.stores.billrecord.sources.careWays.find(
                  (f) => f.id == fCareWayID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "收款类型",
              align: "center",
              key: "fRecType",
              width: 120,
            },
            {
              title: "收款方式",
              align: "center",
              key: "fRecWayID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fRecWayID },
                } = params;
                var tmp = self.stores.billrecord.sources.payWays.find(
                  (f) => f.id == fRecWayID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "结算天数",
              align: "center",
              key: "fDay",
              width: 80,
            },
            {
              title: "累计收款金额",
              align: "center",
              key: "fTotalRecSum",
              width: 120,
            },
            {
              title: "本次应收金额",
              align: "center",
              key: "fPlanRecSum",
              width: 120,
            },
            {
              title: "本次实收金额",
              align: "center",
              key: "fRecSum",
              width: 120,
            },
          ],
        },
        detail2: {
          data: [],
          columns: [
            {
              title: "日期",
              align: "center",
              key: "fDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { fDate },
                } = params;
                var text = dayjs(fDate).format("YYYY-MM-DD HH:mm:ss");

                if (fDate != "" && fDate != null) {
                  return h("span", {}, text);
                }
              },
            },
            {
              title: "生效日期",
              align: "center",
              key: "fBeginDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { fBeginDate },
                } = params;
                var text = `${dayjs(fBeginDate).format("YYYY-MM-DD")}`;

                if (fBeginDate != "" && fBeginDate != null) {
                  return h("span", {}, text);
                }
              },
            },
            {
              title: "失效日期",
              align: "center",
              key: "fEndDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { fEndDate },
                } = params;
                var text = `${dayjs(fEndDate).format("YYYY-MM-DD")}`;

                if (fEndDate != "" && fEndDate != null) {
                  return h("span", {}, text);
                }
              },
            },
            {
              title: "护理方式",
              align: "center",
              key: "fCareWayID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fCareWayID },
                } = params;
                var tmp = self.stores.billrecord.sources.careWays.find(
                  (f) => f.id == fCareWayID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "价格",
              align: "center",
              key: "fPrice",
              width: 80,
            },
          ],
        },
        detail3: {
          data: [],
          columns: [
            {
              title: "日期",
              align: "center",
              key: "fDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { fDate },
                } = params;
                var text = dayjs(fDate).format("YYYY-MM-DD HH:mm:ss");

                if (fDate != "" && fDate != null) {
                  return h("span", {}, text);
                }
              },
            },
            {
              title: "护工",
              align: "center",
              key: "fPersonID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fPersonID },
                } = params;
                var tmp = self.stores.billrecord.sources.persons.find(
                  (f) => f.id == fPersonID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "生效日期",
              align: "center",
              key: "fBeginDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { fBeginDate, fBeginPeriod },
                } = params;
                var text = `${dayjs(fBeginDate).format(
                  "YYYY-MM-DD"
                )}(${fBeginPeriod})`;

                if (fBeginDate != "" && fBeginDate != null) {
                  return h("span", {}, text);
                }
              },
            },
            {
              title: "失效日期",
              align: "center",
              key: "fEndDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { fEndDate, fEndPeriod },
                } = params;
                var text = `${dayjs(fEndDate).format(
                  "YYYY-MM-DD"
                )}(${fEndPeriod})`;

                if (fEndDate != "" && fEndDate != null) {
                  return h("span", {}, text);
                }
              },
            },
            {
              title: "护理方式",
              align: "center",
              key: "fCareWayID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fCareWayID },
                } = params;
                var tmp = self.stores.billrecord.sources.careWays.find(
                  (f) => f.id == fCareWayID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "护理种类",
              align: "center",
              key: "fCareTypeID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fCareTypeID },
                } = params;
                var tmp = self.stores.billrecord.sources.careProjects.find(
                  (f) => f.id == fCareTypeID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
          ],
        },
        detail4: {
          data: [],
          columns: [
            {
              title: "日期",
              align: "center",
              key: "fDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { fDate },
                } = params;
                var text = dayjs(fDate).format("YYYY-MM-DD HH:mm:ss");

                if (fDate != "" && fDate != null) {
                  return h("span", {}, text);
                }
              },
            },
            {
              title: "所属医院",
              align: "center",
              key: "fHospitalID",
              width: 120,
              render: (h, params) => {
                const {
                  row: { fHospitalID },
                } = params;
                var tmp = self.stores.billrecord.sources.hospiatls.find(
                  (f) => f.id == fHospitalID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "病区",
              align: "center",
              key: "fAreaID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fAreaID },
                } = params;
                var tmp = self.stores.billrecord.sources.areas.find(
                  (f) => f.id == fAreaID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "床号",
              align: "center",
              key: "fBedID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fBedID },
                } = params;
                var tmp = self.stores.billrecord.sources.beds.find(
                  (f) => f.id == fBedID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "病人姓名",
              align: "center",
              key: "fClient",
              width: 80,
            },
          ],
        },
      },
    };
  },
  methods: {
    loadRecordList() {
      // if (
      //   this.stores.billrecord.query.dates[0] == "" &&
      //   this.stores.billrecord.query.dates[1] == ""
      // ) {
      //   return this.$Message.error("请输入检索条件!");
      // }
      getBillRecord(
        Object.assign(
          {},
          this.stores.billrecord.query,
          this.stores.billrecord.query.dates.length <= 0
            ? {}
            : {
                fBeginDate:
                  this.stores.billrecord.query.dates[0] == ""
                    ? ""
                    : dayjs(this.stores.billrecord.query.dates[0]).format(
                        "YYYY-MM-DD"
                      ),
                fEndDate:
                  this.stores.billrecord.query.dates[1] == ""
                    ? ""
                    : dayjs(this.stores.billrecord.query.dates[1]).format(
                        "YYYY-MM-DD"
                      ),
              }
        )
      ).then((res) => {
        this.stores.billrecord.data = res.data.data;
        this.stores.billrecord.query.totalCount = res.data.totalCount;
      });
    },
    handleAreaChanged() {
      this.changeBed();
    },
    handleRefresh() {
      this.loadRecordList();
    },
    handleSearchRecordList() {
      this.stores.billrecord.query.currentPage = 1;
      this.loadRecordList();
    },
    rowClsRender(row, index) {
      if (row.isDeleted) {
        return "table-row-disabled";
      }
      return "";
    },
    handlePageChanged(page) {
      this.stores.billrecord.query.currentPage = page;
      this.loadRecordList();
    },
    handlePageSizeChanged(pageSize) {
      this.stores.billrecord.query.pageSize = pageSize;
      this.loadRecordList();
    },
    exportExcel() {
      if (this.stores.billrecord.data.length <= 0) {
        return this.$Message.error("没有发现可以导出的数据!");
      }
      return ExportExcel(
        Object.assign(
          {},
          this.stores.billrecord.query,
          this.stores.billrecord.query.dates.length <= 0
            ? {}
            : {
                FBeginDate:
                  this.stores.billrecord.query.dates[0] == ""
                    ? ""
                    : dayjs(this.stores.billrecord.query.dates[0]).format(
                        "YYYY-MM-DD"
                      ),
                FEndDate:
                  this.stores.billrecord.query.dates[1] == ""
                    ? ""
                    : dayjs(this.stores.billrecord.query.dates[1]).format(
                        "YYYY-MM-DD"
                      ),
              }
        )
      ).then((response) => {
        const { data, state, mesage } = response.data;
        if (state == "success") {
          const { filename, file } = data;
          let fileexcle = b64toFile(
            file,
            filename,
            "application/vnd.ms-excel;charset=utf-8"
          );
          saveAs(fileexcle, filename);
        } else {
          this.$Notice.error({
            title: "警告",
            desc: "没有查询到要导出的数据!",
          });
        }
      });
    },
    showDraw(v) {
      if (v) {
        this.loadDetail1();
        this.loadDetail2();
        this.loadDetail3();
        this.loadDetail4();
      }
    },
    loadDetail1() {
      getBillDetail(this.curRecord.fid).then((res) => {
        this.stores.detail.data = res.data.data;
      });
    },
    loadDetail2() {
      getBillPriceDetail(this.curRecord.fid).then((res) => {
        this.stores.detail2.data = res.data.data;
      });
    },
    loadDetail3() {
      getBillPersonDetail(this.curRecord.fid).then((res) => {
        this.stores.detail3.data = res.data.data;
      });
    },
    loadDetail4() {
      getBillClientDetail(this.curRecord.fid).then((res) => {
        this.stores.detail4.data = res.data.data;
      });
    },
    handleUpdate(fid, mark) {
      this.$Modal.confirm({
        title: "操作提示",
        content: `<p>请确认要<strong style='color:red'>${
          mark ? "中止" : "恢复"
        }</strong>此笔单据吗?</p>`,
        loading: true,
        onOk: () => {
          updateBillsStop({
            isStop: mark,
            userId: this.$store.state.user.userGuid,
            ids: fid,
          })
            .then((res) => {
              if (res.data.code === 200) {
                this.handleSearchRecordList();
              } else {
                this.$Message.warning(res.data.message);
              }
              this.$Modal.remove();
            })
            .catch((err) => {});
        },
      });
    },
    changeBed() {
      getBedSelectAll({
        HospitalId: this.stores.billrecord.query.fhospitalid,
        AreaId: this.stores.billrecord.query.fareaid,
      }).then((res) => {
        const { state, data } = res.data;
        if (state == "success") {
          this.stores.billrecord.sources.beds = data;
        }
      });
    },
  },
  mounted() {
    getHospitalSelect().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.hospiatls = data;
      }
    });

    getAreaSelectAll().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.areas = data;
      }
    });

    getBedSelectAll({
      HospitalId: this.stores.billrecord.query.fhospitalid,
      AreaId: this.stores.billrecord.query.fareaid,
    }).then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.beds = data;
      }
    });

    getManagerSelectAll().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.managers = data;
      }
    });

    getCareProjectSelectAll().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.careProjects = data;
      }
    });
    getCareWaySelectAll().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.careWays = data;
      }
    });
    getPayWaySelectAll().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.payWays = data;
      }
    });
    getPcSelectAll().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.persons = data;
      }
    });
    getUserSelectAll().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.users = data;
      }
    });
  },
};
</script>

<style>
</style>
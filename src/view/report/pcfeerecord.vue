<template>
  <div>
    <Card>
      <dz-table
        :showPagination="false"
        :totalCount="stores.pcfee.query.totalCount"
        :pageSize="stores.pcfee.query.pageSize"
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
                      v-model="stores.pcfee.query.kw"
                      placeholder="输入护工编码、护工姓名进行搜索..."
                      @on-search="handleSearchRecordList()"
                    >
                      <span slot="prepend">检索</span>
                    </Input>
                  </FormItem>
                  <FormItem>
                    <DatePicker
                      search
                      :value="dates"
                      v-model="stores.pcfee.query.dates"
                      type="datetimerange"
                      style="width: 200px"
                      format="yyyy-MM-dd"
                      placeholder="请选择护理结算日期"
                      clearable
                      @on-ok="handleSearchRecordList()"
                    ></DatePicker>
                  </FormItem>
                  <FormItem>
                    <Select
                      clearable
                      v-model="stores.pcfee.query.fhospitalid"
                      @on-change="handleSearchRecordList"
                      style="width: 150px"
                    >
                      <Option
                        v-for="item in stores.pcfee.sources.hospiatls"
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
          :data="stores.pcfee.data"
          :columns="stores.pcfee.columns"
          @on-refresh="handleRefresh"
          :row-class-name="rowClsRender"
          @on-page-change="handlePageChanged"
          @on-page-size-change="handlePageSizeChanged"
        ></Table>
      </dz-table>
    </Card>
  </div>
</template>

<script>
import DzTable from "_c/tables/dz-table.vue";
import dayjs from "dayjs";
import { getPcFee, ExportExcel } from "@/api/sys/pcfee";
import { getHospitalSelect } from "@/api/base/hospital";
import { b64toFile } from "@/libs/tools";
import { saveAs } from "file-saver";
export default {
  name: "pcfee_record_page",
  components: {
    DzTable,
  },
  data() {
    var self = this;
    return {
      loading: false,
      dates: [dayjs().format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")],
      stores: {
        pcfee: {
          query: {
            totalCount: 0,
            pageSize: 20,
            currentPage: 1,
            kw: "",
            fhospitalid: -1,
            // fpcid: -1,
            sort: [
              {
                direct: "DESC",
                field: "fdate",
              },
            ],
            dates: [
              dayjs().startOf("month").format("YYYY-MM-DD"),
              dayjs().endOf("month").format("YYYY-MM-DD"),
            ],
          },
          columns: [
            {
              title: "护工身份证",
              align: "center",
              key: "FPcCode",
              width: 150,
            },
            {
              title: "护工",
              align: "center",
              key: "FPcName",
              width: 80,
            },
            {
              title: "护理天数",
              align: "center",
              key: "FDay",
              width: 80,
            },
            {
              title: "护理总金额",
              align: "center",
              key: "FCost",
              width: 80,
              render: (h, params) => {
                const {
                  row: { FCost },
                } = params;
                return h("span", {}, Number(FCost).toFixed(2));
              },
            },
            {
              title: "医院管理费",
              align: "center",
              key: "FHospitalMgrCost",
              width: 80,
              render: (h, params) => {
                const {
                  row: { FHospitalMgrCost },
                } = params;
                return h("span", {}, Number(FHospitalMgrCost).toFixed(2));
              },
            },
            {
              title: "医院管理费",
              align: "center",
              key: "FCompanyMgrCost",
              width: 80,
              render: (h, params) => {
                const {
                  row: { FCompanyMgrCost },
                } = params;
                return h("span", {}, Number(FCompanyMgrCost).toFixed(2));
              },
            },
            {
              title: "护工费",
              align: "center",
              key: "FPersonCost",
              width: 80,
              render: (h, params) => {
                const {
                  row: { FPersonCost },
                } = params;
                return h("span", {}, Number(FPersonCost).toFixed(2));
              },
            },
            {
              title: "节日工资",
              align: "center",
              key: "FHolidayCost",
              width: 120,
              render: (h, params) => {
                const {
                  row: { FHolidayCost },
                } = params;
                return h("span", {}, Number(FHolidayCost).toFixed(2));
              },
            },
            {
              title: "护工总费用",
              align: "center",
              key: "FTotalPersonCost",
              width: 120,
              render: (h, params) => {
                const {
                  row: { FTotalPersonCost },
                } = params;
                return h("span", {}, Number(FTotalPersonCost).toFixed(2));
              },
            },
            {
              title: "医院",
              align: "center",
              key: "FHospitalName",
              width: 120,
            },
          ],
          sources: {
            yesorno: [
              { value: -1, text: "全部" },
              { value: 0, text: "否" },
              { value: 1, text: "是" },
            ],
            hospiatls: [],
          },
          data: [],
        },
      },
    };
  },
  methods: {
    loadRecordList() {
      getPcFee(
        Object.assign(
          {},
          this.stores.pcfee.query,
          this.stores.pcfee.query.dates.length <= 0
            ? {}
            : {
                fBeginDate:
                  this.stores.pcfee.query.dates[0] == ""
                    ? ""
                    : dayjs(this.stores.pcfee.query.dates[0]).format(
                        "YYYY-MM-DD"
                      ),
                fEndDate:
                  this.stores.pcfee.query.dates[1] == ""
                    ? ""
                    : dayjs(this.stores.pcfee.query.dates[1]).format(
                        "YYYY-MM-DD"
                      ),
              }
        )
      ).then((res) => {
        this.stores.pcfee.data = res.data.data;
        this.stores.pcfee.query.totalCount = res.data.totalCount;
      });
    },
    handleRefresh() {
      this.loadRecordList();
    },
    handleSearchRecordList() {
      this.stores.pcfee.query.currentPage = 1;
      this.loadRecordList();
    },
    rowClsRender(row, index) {
      if (row.isDeleted) {
        return "table-row-disabled";
      }
      return "";
    },
    handlePageChanged(page) {
      this.stores.pcfee.query.currentPage = page;
      this.loadRecordList();
    },
    handlePageSizeChanged(pageSize) {
      this.stores.pcfee.query.pageSize = pageSize;
      this.loadRecordList();
    },
    exportExcel() {
      const self = this;
      if (this.stores.pcfee.data.length <= 0) {
        return this.$Message.error("没有发现可以导出的数据!");
      }
      return ExportExcel(
        Object.assign(
          {},
          this.stores.pcfee.query,
          this.stores.pcfee.query.dates.length <= 0
            ? {}
            : {
                FBeginDate:
                  this.stores.pcfee.query.dates[0] == ""
                    ? ""
                    : dayjs(this.stores.pcfee.query.dates[0]).format(
                        "YYYY-MM-DD"
                      ),
                FEndDate:
                  this.stores.pcfee.query.dates[1] == ""
                    ? ""
                    : dayjs(this.stores.pcfee.query.dates[1]).format(
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
  },
  mounted() {
    getHospitalSelect().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.pcfee.sources.hospiatls = data;
      }
    });
  },
};
</script>

<style>
</style>

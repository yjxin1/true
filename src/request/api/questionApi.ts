import request from '@/request/request';
import type { Question,QuestionRecord } from '@/types';

const questionApi = {
    //分页查询
    page(params:any) {
        const config = {
            method: 'get',
            url: '/api/question/page',
            params:params
        }
        return request(config)
    },
    //更新
    update(question:Partial<Question>){
        const config = {
            method: 'put',
            url: '/api/question',
            data:question
        }
        return request(config)
    },
    //根据ids批量删除用户
    deleteByIds(ids:number[]){
        const config={
            method:'delete',
            url:`/api/question/${ids.join(',')}`,
        }
        return request(config)
    },
    //添加
    add(question:Partial<Question>){
        const config={
            method:'post',
            url:'/api/question',
            data:question
        }
        return request(config)
    },
    //取消添加,需要删除已上传的图片
    cancelCover(cover:string){
        const config={
            method:'delete',
            url:`/api/image/questionCover`,
            params:{
                questionCover:cover
            }
        }
        // console.log(config)
        return request(config)
    },


    //答题记录相关API
    getRecord(userId:number){
        const config={
            method:'get',
            url:`/api/question/record`,
            params:{
                userId:userId
            }
        }
        return request(config)
    },
    addRecord(questionRecord:Partial<QuestionRecord>){
        const config={
            method:'post',
            url:`/api/question/record`,
            data:questionRecord
        }
        return request(config)
    },
    deleteRecordByIds(ids:number[]){
        const config={
            method:'delete',
            url:`/api/question/record/${ids.join(',')}`,
        }
        return request(config)
    },

}
export default questionApi
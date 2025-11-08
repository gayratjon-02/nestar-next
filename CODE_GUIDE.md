# Nestar Next.js - Kod Yozish Qo'llanmasi

## 📋 Loyiha Strukturasi

### 1. **Asosiy Kataloglar**

```
nestar-next/
├── apollo/           # GraphQL client va query/mutationlar
│   ├── client.ts     # Apollo Client konfiguratsiyasi
│   ├── store.ts      # Reactive variables (userVar, themeVar)
│   ├── user/         # User uchun query va mutationlar
│   └── admin/        # Admin uchun query va mutationlar
├── libs/             # Asosiy library va komponentlar
│   ├── components/   # React komponentlar
│   ├── types/        # TypeScript type definitions
│   ├── enums/        # Enumlar
│   ├── hooks/        # Custom React hooks
│   ├── config.ts     # Konfiguratsiya
│   ├── utils.ts      # Utility funksiyalar
│   └── sweetAlert.ts # Alert funksiyalar
├── pages/            # Next.js pages (routing)
└── scss/             # Styling fayllar
```

---

## 🎯 Kod Yozishda E'tibor Berish Kerak Bo'lgan Nuqtalar

### 1. **Apollo GraphQL Query Pattern**

**Pattern:**
```typescript
const {
  loading: queryNameLoading,
  data: queryNameData,
  error: queryNameError,
  refetch: queryNameRefetch,
} = useQuery(QUERY_NAME, {
  fetchPolicy: 'network-only', // yoki 'cache-and-network'
  variables: { input: filterState },
  notifyOnNetworkStatusChange: true,
  skip: condition, // optional: skip query if condition is true
  onCompleted: (data: T) => {
    // Set state from data
    setState(data?.queryName?.list || []);
    setTotal(data?.queryName?.metaCounter?.total || 0);
  }
});
```

**⚠️ MUHIM:**
- `fetchPolicy: 'network-only'` - har doim serverdan yangi ma'lumot olish
- `fetchPolicy: 'cache-and-network'` - avval cache, keyin network
- `skip` - query'ni shartli o'tkazib yuborish
- `onCompleted` - ma'lumotlar yuklanganda state'ni yangilash

---

### 2. **State Management Pattern**

**Asosiy State Pattern:**
```typescript
// 1. Filter state
const [searchFilter, setSearchFilter] = useState<TypeInquiry>(initialInput);

// 2. Data state
const [items, setItems] = useState<ItemType[]>([]);

// 3. Total count state
const [total, setTotal] = useState<number>(0);

// 4. Current page state
const [currentPage, setCurrentPage] = useState<number>(1);
```

**⚠️ MUHIM:**
- `searchFilter` - har doim inquiry type bo'lishi kerak
- `total` - API'dan `metaCounter.total` dan olinadi
- State'larni to'g'ri initialize qiling

---

### 3. **useEffect Pattern**

**Query Parameter Change:**
```typescript
useEffect(() => {
  if (router.query.input) {
    const inputObj = JSON.parse(router?.query?.input as string);
    setSearchFilter(inputObj);
    setCurrentPage(inputObj.page === undefined ? 1 : inputObj.page);
  }
}, [router]);
```

**Filter Change (Refetch):**
```typescript
useEffect(() => {
  if (searchFilter) {
    queryRefetch({ input: searchFilter });
  }
}, [searchFilter]);
```

**⚠️ MUHIM:**
- Router query o'zgarganda filter'ni yangilash
- Filter o'zgarganda query'ni refetch qilish
- Infinite loop'lardan qochish (dependency array to'g'ri)

---

### 4. **Pagination Pattern**

**Handler:**
```typescript
const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
  const updatedFilter = { ...searchFilter, page: value };
  setSearchFilter(updatedFilter);
  await router.push(
    `/page?input=${JSON.stringify(updatedFilter)}`,
    `/page?input=${JSON.stringify(updatedFilter)}`,
    { scroll: false }
  );
  setCurrentPage(value);
};
```

**⚠️ MUHIM:**
- Filter'ni immutable tarzda yangilash (`{ ...searchFilter }`)
- URL'ni yangilash
- `scroll: false` - scroll qilmaslik

---

### 5. **Like Handler Pattern**

**Property Like:**
```typescript
const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

const likePropertyHandler = async (user: T, id: string) => {
  try {
    if (!id) return;
    if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
    
    await likeTargetProperty({
      variables: { input: id },
    });
    
    // Refetch related queries
    await queryRefetch({ input: searchFilter });
    
    await sweetTopSmallSuccessAlert('success', 800);
  } catch (err: any) {
    console.log('ERROR: likePropertyHandler', err.message);
    sweetMixinErrorAlert(err.message).then();
  }
};
```

**⚠️ MUHIM:**
- User authentication tekshirish
- Mutation'dan keyin refetch qilish
- Error handling

---

### 6. **Comment Pattern**

**Create Comment:**
```typescript
const [createComment] = useMutation(CREATE_COMMENT);

const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
  commentGroup: CommentGroup.MEMBER, // yoki PROPERTY, ARTICLE
  commentContent: '',
  commentRefId: '', // Member ID, Property ID, yoki Article ID
});

const createCommentHandler = async () => {
  try {
    if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
    
    await createComment({
      variables: { input: insertCommentData },
    });
    
    // Clear form
    setInsertCommentData({
      ...insertCommentData,
      commentContent: '',
    });
    
    // Refetch comments
    await getCommentsRefetch({ input: commentInquiry });
  } catch (err: any) {
    sweetErrorHandling(err).then();
  }
};
```

**⚠️ MUHIM:**
- `commentGroup` - to'g'ri enum tanlash (MEMBER, PROPERTY, ARTICLE, COMMENT)
- `commentRefId` - tegishli ID ni o'rnatish
- Comment yaratgandan keyin refetch

---

### 7. **Query Types**

**GET_AGENTS:**
```typescript
// Query
const { data } = useQuery(GET_AGENTS, {
  variables: { input: AgentsInquiry }
});

// Response structure
data?.getAgents?.list        // Member[]
data?.getAgents?.metaCounter?.total  // number
```

**GET_AGENT_PROPERTIES:**
```typescript
// Query
const { data } = useQuery(GET_AGENT_PROPERTIES, {
  variables: { input: AgentPropertiesInquiry }
});

// Response structure
data?.getAgentProperties?.list        // Property[]
data?.getAgentProperties?.metaCounter?.total  // number
```

**GET_MEMBER:**
```typescript
// Query
const { data } = useQuery(GET_MEMBER, {
  variables: { input: memberId: string }
});

// Response structure
data?.getMember  // Member
```

**GET_COMMENTS:**
```typescript
// Query
const { data } = useQuery(GET_COMMENTS, {
  variables: { input: CommentsInquiry }
});

// Response structure
data?.getComments?.list        // Comment[]
data?.getComments?.metaCounter[0]?.total  // number
```

---

### 8. **Type Definitions**

**AgentPropertiesInquiry:**
```typescript
{
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;  // 'ASC' | 'DESC'
  search: {
    propertyStatus?: PropertyStatus;
  };
}
```

**PropertiesInquiry (Property listing uchun):**
```typescript
{
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: {
    memberId?: string;  // Agent ID
    locationList?: PropertyLocation[];
    typeList?: PropertyType[];
    // ... boshqa filterlar
  };
}
```

**CommentsInquiry:**
```typescript
{
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: {
    commentRefId: string;  // Member ID, Property ID, yoki Article ID
  };
}
```

---

### 9. **Component Props Pattern**

**PropertyBigCard:**
```typescript
<PropertyBigCard 
  property={property} 
  likePropertyHandler={likePropertyHandler}  // optional
/>
```

**AgentCard:**
```typescript
<AgentCard agent={agent} />
```

**ReviewCard:**
```typescript
<ReviewCard comment={comment} />
```

---

### 10. **Error Handling**

**Pattern:**
```typescript
try {
  // Operation
} catch (err: any) {
  console.log('ERROR: handlerName', err.message);
  sweetErrorHandling(err).then();
  // yoki
  sweetMixinErrorAlert(err.message).then();
}
```

---

### 11. **Loading States**

**Pattern:**
```typescript
if (loading) {
  return (
    <Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress size={'4rem'} />
    </Stack>
  );
}
```

---

### 12. **Empty States**

**Pattern:**
```typescript
{items?.length === 0 ? (
  <div className={'no-data'}>
    <img src="/img/icons/icoAlert.svg" alt="" />
    <p>No items found!</p>
  </div>
) : (
  items.map((item) => <ItemCard item={item} />)
)}
```

---

### 13. **URL Query Parameter Pattern**

**Set:**
```typescript
await router.push(
  `/page?input=${JSON.stringify(filter)}`,
  `/page?input=${JSON.stringify(filter)}`,
  { scroll: false }
);
```

**Read:**
```typescript
useEffect(() => {
  if (router.query.input) {
    const inputObj = JSON.parse(router?.query?.input as string);
    setSearchFilter(inputObj);
  }
}, [router]);
```

---

### 14. **Device Detection**

**Pattern:**
```typescript
const device = useDeviceDetect();

if (device === 'mobile') {
  return <div>MOBILE VIEW</div>;
} else {
  return <div>DESKTOP VIEW</div>;
}
```

---

## 🔥 Agent Detail Page Uchun Tavsiyalar

### 1. **GET_MEMBER Query Qo'shish**
```typescript
const {
  loading: getMemberLoading,
  data: getMemberData,
  refetch: getMemberRefetch,
} = useQuery(GET_MEMBER, {
  fetchPolicy: 'network-only',
  variables: { input: mbId },
  skip: !mbId,
  onCompleted: (data: T) => {
    setAgent(data?.getMember || null);
  }
});
```

### 2. **GET_AGENT_PROPERTIES Query Qo'shish**
```typescript
const {
  loading: getAgentPropertiesLoading,
  data: getAgentPropertiesData,
  refetch: getAgentPropertiesRefetch,
} = useQuery(GET_AGENT_PROPERTIES, {
  fetchPolicy: 'network-only',
  variables: { 
    input: {
      ...searchFilter,
      search: {
        propertyStatus: PropertyStatus.ACTIVE, // yoki kerakli status
      }
    }
  },
  skip: !mbId,
  onCompleted: (data: T) => {
    setAgentProperties(data?.getAgentProperties?.list || []);
    setPropertyTotal(data?.getAgentProperties?.metaCounter?.total || 0);
  }
});
```

### 3. **GET_COMMENTS Query Qo'shish**
```typescript
const {
  loading: getCommentsLoading,
  data: getCommentsData,
  refetch: getCommentsRefetch,
} = useQuery(GET_COMMENTS, {
  fetchPolicy: 'network-only',
  variables: { input: commentInquiry },
  skip: !commentInquiry.search.commentRefId,
  onCompleted: (data: T) => {
    setAgentComments(data?.getComments?.list || []);
    setCommentTotal(data?.getComments?.metaCounter[0]?.total || 0);
  }
});
```

### 4. **useEffect'larni To'ldirish**
```typescript
// Agent ID o'zgarganda
useEffect(() => {
  if (router.query.agentId) {
    const agentId = router.query.agentId as string;
    setMbId(agentId);
    
    // Comment inquiry ni yangilash
    setCommentInquiry({
      ...commentInquiry,
      search: { commentRefId: agentId },
    });
    
    // Insert comment data ni yangilash
    setInsertCommentData({
      ...insertCommentData,
      commentRefId: agentId,
    });
    
    // Property filter ni yangilash (agar kerak bo'lsa)
    setSearchFilter({
      ...searchFilter,
      search: {
        ...searchFilter.search,
        memberId: agentId, // Agar PropertiesInquiry ishlatilsa
      }
    });
  }
}, [router]);

// Search filter o'zgarganda
useEffect(() => {
  if (mbId && searchFilter) {
    getAgentPropertiesRefetch({ 
      input: {
        ...searchFilter,
        search: {
          propertyStatus: PropertyStatus.ACTIVE,
        }
      }
    });
  }
}, [searchFilter, mbId]);

// Comment inquiry o'zgarganda
useEffect(() => {
  if (commentInquiry.search.commentRefId) {
    getCommentsRefetch({ input: commentInquiry });
  }
}, [commentInquiry]);
```

### 5. **Like Property Handler Qo'shish**
```typescript
const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

const likePropertyHandler = async (user: T, id: string) => {
  try {
    if (!id) return;
    if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
    
    await likeTargetProperty({
      variables: { input: id },
    });
    
    // Refetch agent properties
    await getAgentPropertiesRefetch({ 
      input: {
        ...searchFilter,
        search: {
          propertyStatus: PropertyStatus.ACTIVE,
        }
      }
    });
    
    await sweetTopSmallSuccessAlert('success', 800);
  } catch (err: any) {
    console.log('ERROR: likePropertyHandler', err.message);
    sweetMixinErrorAlert(err.message).then();
  }
};
```

### 6. **Create Comment Handler To'ldirish**
```typescript
const createCommentHandler = async () => {
  try {
    if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
    if (!insertCommentData.commentContent.trim()) {
      throw new Error('Comment content is required');
    }
    
    await createComment({
      variables: { input: insertCommentData },
    });
    
    // Clear form
    setInsertCommentData({
      ...insertCommentData,
      commentContent: '',
    });
    
    // Refetch comments
    await getCommentsRefetch({ input: commentInquiry });
    
    await sweetTopSmallSuccessAlert('Comment added successfully', 800);
  } catch (err: any) {
    sweetErrorHandling(err).then();
  }
};
```

### 7. **PropertyBigCard ga likePropertyHandler Props Qo'shish**
```typescript
<PropertyBigCard 
  property={property} 
  likePropertyHandler={likePropertyHandler}
  key={property?._id} 
/>
```

---

## ⚠️ MUHIM ESLATMALAR

1. **Type Safety:**
   - Har doim TypeScript type'larni ishlating
   - `T` type umumiy type, lekin maxsus type'larni afzal qiling

2. **Error Handling:**
   - Har doim try-catch ishlating
   - User'ga tushunarli xabarlar ko'rsating

3. **Loading States:**
   - Query loading bo'lganda loading indicator ko'rsating

4. **Empty States:**
   - Ma'lumot bo'lmasa empty state ko'rsating

5. **Pagination:**
   - URL'ni yangilash
   - Immutable state updates

6. **Refetch:**
   - Mutation'dan keyin kerakli query'larni refetch qiling

7. **Authentication:**
   - User'ni tekshiring (`user._id`)

8. **Device Detection:**
   - Mobile va Desktop uchun alohida view'lar

---

## 📚 Foydali Resurslar

- **Apollo Client:** https://www.apollographql.com/docs/react/
- **Next.js:** https://nextjs.org/docs
- **Material-UI:** https://mui.com/
- **TypeScript:** https://www.typescriptlang.org/docs/

---

## 🎯 Xulosa

Ushbu qo'llanmada loyihadagi asosiy patternlar va best practice'lar keltirilgan. Kod yozayotganda ushbu pattern'larni qo'llang va loyiha strukturasiga rioya qiling.

